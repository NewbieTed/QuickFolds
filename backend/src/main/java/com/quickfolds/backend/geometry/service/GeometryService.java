package com.quickfolds.backend.geometry.service;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.exception.DbException;
import com.quickfolds.backend.geometry.constants.EdgeType;
import com.quickfolds.backend.geometry.constants.PointType;
import com.quickfolds.backend.geometry.constants.StepType;
import com.quickfolds.backend.geometry.mapper.*;
import com.quickfolds.backend.geometry.model.database.*;
import com.quickfolds.backend.geometry.model.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;


/**
 * Service class responsible for managing geometric operations in the origami system.
 * This includes creating initial geometry, handling annotation requests,
 * and managing face, edge, and point modifications.
 * <p>
 * Dependencies:
 * - Mappers for database operations (FaceMapper, EdgeMapper, StepMapper, etc.).
 * - Uses transactional operations for consistency.
 * <p>
 * Logging:
 * - Utilizes SLF4J for logging important actions and errors.
 */
@Service
@RequiredArgsConstructor
public class GeometryService {

    // Data mappers responsible for retrieving and modifying step-related data.
    private final StepMapper stepMapper;
    private final StepTypeMapper stepTypeMapper;
    private final FoldStepMapper foldStepMapper;

    // Mapper for handling faces (polygonal regions) in an origami structure.
    private final FaceMapper faceMapper;

    // Mappers for handling edges and their relationships in origami.
    private final EdgeMapper edgeMapper;
    private final SideEdgeMapper sideEdgeMapper;
    private final FoldEdgeMapper foldEdgeMapper;
    private final EdgeTypeMapper edgeTypeMapper;

    // Mappers for handling origami points and their types (e.g., vertices, annotations).
    private final PointTypeMapper pointTypeMapper;
    private final OrigamiPointMapper origamiPointMapper;
    private final AnnotatePointMapper annotatePointMapper;

    // Mapper for handling annotated lines in origami structures.
    private final AnnotateLineMapper annotateLineMapper;

    // Logger for debugging and tracking operations in GeometryService.
    private static final Logger logger = LoggerFactory.getLogger(GeometryService.class);

    /**
     * Handles the folding process by deleting specified faces,
     * creating new faces, and managing edges and vertices.
     *
     * @param request The request object containing the faces to delete and add.
     * @return ResponseEntity with a BaseResponse indicating success.
     */
    @Transactional
    public ResponseEntity<BaseResponse<Boolean>> fold(FoldRequest request) {
        long origamiId = request.getOrigamiId();
        int stepIdInOrigami = request.getStepIdInOrigami();
        long stepId = createStep(origamiId, StepType.FOLD, stepIdInOrigami);

        // Delete specified faces
        deleteFaces(origamiId, stepId, request.getDeletedFaces());

        // Create new faces and associated vertices/edges
        processFaceRequests(request.getFaces(), origamiId, stepId);

        // Create fold step with anchored face
        Long anchoredFaceId = getAnchoredFaceId(origamiId, request.getAnchoredFaceIdInOrigami());
        createFoldStep(stepId, anchoredFaceId);

        // Annotate faces based on new geometry
        annotate(new AnnotationRequest(origamiId, stepIdInOrigami, collectFaceAnnotations(request.getFaces())));

        return BaseResponse.success();
    }

    /**
     * Processes an annotation request, handling points and lines on origami faces.
     * Supports addition and deletion of annotations.
     * <p>
     * - Retrieves and validates step and point types.
     * - Processes face annotations, deleting and adding points/lines as needed.
     * - Throws exceptions if invalid operations are attempted (e.g., deleting non-existent points/lines).
     *
     * @param request The annotation request containing face modifications.
     * @return ResponseEntity with a BaseResponse indicating success.
     * @throws DbException if step type or point type is missing in the database.
     * @throws IllegalArgumentException if:
     *         - A face ID is missing in the request.
     *         - Attempting to delete an annotated point that has dependent lines.
     *         - Attempting to delete or add a non-existent or duplicate point/line.
     */
    @Transactional
    public ResponseEntity<BaseResponse<Boolean>> annotate(AnnotationRequest request) {
        // Extract origami and step information.
        long origamiId = request.getOrigamiId();
        int stepIdInOrigami = request.getStepIdInOrigami();

        // TODO: Case overwrite
        logger.info("Starting annotation for origamiId={}, stepIdInOrigami={}", origamiId, stepIdInOrigami);

        // Retrieve point type ID for annotated points.
        Long pointTypeId = getPointTypeId(PointType.ANNOTATED_POINT);

        // Create new step
        long stepId = createStep(origamiId, StepType.ANNOTATE, stepIdInOrigami);

        // Process each face annotation in the request.
        for (FaceAnnotateRequest face : request.getFaces()) {
            long faceId = getFaceId(origamiId, face.getIdInOrigami());

            deleteAnnotatedLines(origamiId, faceId, stepId, face.getAnnotations().getDeletedLines());
            deleteAnnotatedPoints(origamiId, faceId, stepId, face.getAnnotations().getDeletedPoints());
            addAnnotatedPoints(faceId, stepId, pointTypeId, face.getAnnotations().getPoints());
            addAnnotatedLines(faceId, stepId, face.getAnnotations().getLines());
        }

        return BaseResponse.success();
    }


    /* -----------------------------------------------------------------------------------------------
     *  Utils
     * ---------------------------------------------------------------------------------------------*/
    /**
     * Processes the creation of new faces during a fold operation.
     * This includes adding vertices and edges for each new face.
     *
     * @param faceRequests List of new faces to add.
     * @param origamiId The ID of the origami.
     * @param stepId The current fold step ID.
     * @throws DbException if face creation fails.
     */
    private void processFaceRequests(List<FaceFoldRequest> faceRequests, long origamiId, long stepId) {
        long pointTypeId = getPointTypeId(PointType.VERTEX);
        long foldEdgeTypeId = getEdgeTypeId(EdgeType.FOLD);
        long sideEdgeTypeId = getEdgeTypeId(EdgeType.SIDE);

        for (FaceFoldRequest faceRequest : faceRequests) {
            // Create face, vertices, and edges
            long faceId = createFace(stepId, faceRequest.getIdInOrigami(), origamiId);
            List<Long> vertexIds = addVertices(faceId, stepId, pointTypeId, faceRequest.getVertices());
            addEdges(origamiId, faceId, stepId, vertexIds, faceRequest.getEdges(), foldEdgeTypeId, sideEdgeTypeId);
        }
    }

    private List<FaceAnnotateRequest> collectFaceAnnotations(List<FaceFoldRequest> faceRequests) {
        List<FaceAnnotateRequest> annotations = new ArrayList<>();
        for (FaceFoldRequest request : faceRequests) {
            FaceAnnotateRequest annotateRequest = new FaceAnnotateRequest();
            annotateRequest.setIdInOrigami(request.getIdInOrigami());
            annotateRequest.setAnnotations(request.getAnnotations());
            annotations.add(annotateRequest);
        }
        return annotations;
    }

    /**
     * Retrieves the database ID for a face using its ID in origami.
     * @param origamiId The ID of the origami.
     * @param faceIdInOrigami The face ID in the origami structure.
     * @return The database ID of the face.
     * @throws IllegalArgumentException if the face ID is missing.
     */
    private long getFaceId(long origamiId, Integer faceIdInOrigami) {
        if (faceIdInOrigami == null) {
            throw new IllegalArgumentException("Face id in origami not given, " +
                    "verify if request is valid (no face in origami id)");
        }

        Long faceId = faceMapper.getIdByFaceIdInOrigami(origamiId, faceIdInOrigami);

        // Check if face ID is found
        if (faceId == null) {
            throw new IllegalArgumentException("Invalid face ID, verify if request is valid (invalid face ID)");
        }

        return faceId;
    }

    private Long getAnchoredFaceId(long origamiId, int anchoredFaceIdInOrigami) {
        Long anchoredFaceId = faceMapper.getIdByFaceIdInOrigami(origamiId, anchoredFaceIdInOrigami);
        if (anchoredFaceId == null) {
            throw new IllegalArgumentException("Anchored face id not found, verify if request is valid (no such face)");
        }
        return anchoredFaceId;
    }


    private long getPointTypeId(String pointTypeName) {
        // Retrieve the vertex point type ID from the database.
        Long pointTypeId = pointTypeMapper.getIdByName(pointTypeName);

        // Check if point type ID is found
        if (pointTypeId == null) {
            throw new DbException("Cannot find step type ID with type name: " + PointType.VERTEX +
                    ", verify if DB is correctly set up");
        }

        return pointTypeId;
    }

    private Long getEdgeTypeId(String edgeTypeName) {
        Long edgeTypeId = edgeTypeMapper.getEdgeTypeByName(edgeTypeName);
        if (edgeTypeId == null) {
            throw new DbException("Unknown edge type: " + edgeTypeName + ", check if DB is set correctly");
        }
        return edgeTypeId;
    }

    /**
     * Creates a new step in the annotation process for an origami.
     * @param origamiId The ID of the origami.
     * @param stepTypeName The name of the step type.
     * @param stepIdInOrigami The step number in the origami.
     * @return The database ID of the newly created step.
     */
    private long createStep(long origamiId, String stepTypeName, int stepIdInOrigami) {
        Long stepTypeId = stepTypeMapper.getIdByName(StepType.FOLD);
        if (stepTypeId == null) {
            throw new DbException("Unknown step type: " + stepTypeName + ", check if DB is set correctly");
        }

        Step step = new Step();
        step.setOrigamiId(origamiId);
        step.setStepTypeId(stepTypeId);
        step.setIdInOrigami(stepIdInOrigami);
        stepMapper.addByObj(step);

        Long stepId = stepMapper.getIdByIdInOrigami(origamiId, stepIdInOrigami);

        if (stepId == null) {
            throw new DbException("Cannot find step ID that is just created, verify if SQL is correct");
        }

        return stepId;
    }


    /**
     * Creates a new fold step in the fold process for an origami.
     * @param stepId The step ID of the fold step.
     * @param anchoredFaceId the ID of the anchored face in the fold operation.
     */
    private void createFoldStep(long stepId, Long anchoredFaceId) {
        FoldStep foldStep = new FoldStep();
        foldStep.setStepId(stepId);
        foldStep.setAnchoredFaceId(anchoredFaceId);
        foldStepMapper.addByObj(foldStep);
    }


    private long createFace(long stepId, int faceIdInOrigami, long origamiId) {
        Face face = new Face();
        face.setStepId(stepId);
        face.setIdInOrigami(faceIdInOrigami);
        faceMapper.addByObj(face);

        Long faceId = faceMapper.getIdByFaceIdInOrigami(origamiId, faceIdInOrigami);
        if (faceId == null) {
            throw new DbException("Cannot find created face ID, verify if SQL is correct");
        }
        return faceId;
    }

    private long createEdge(long stepId, Long edgeTypeId) {
        Edge edge = new Edge();
        edge.setStepId(stepId);
        edge.setEdgeTypeId(edgeTypeId);
        edgeMapper.addByObj(edge);

        Long edgeId = edgeMapper.getMostRecentId(stepId);
        if (edgeId == null) {
            throw new DbException("Cannot find created edge ID, verify if SQL is correct");
        }
        return edgeId;
    }

    private void createFoldEdge(Long origamiId, long faceId, int idInFace1, FoldEdgeRequest request, long edgeId) {
        Long otherFaceId = faceMapper.getIdByFaceIdInOrigami(origamiId, request.getOtherFaceIdInOrigami());
        if (otherFaceId == null) return;

        FoldEdge foldEdge = new FoldEdge();
        foldEdge.setEdgeId(edgeId);
        foldEdge.setFace1Id(faceId);
        foldEdge.setFace2Id(otherFaceId);
        foldEdge.setAngle(request.getAngle());
        foldEdge.setIdInFace1(idInFace1);
        foldEdge.setIdInFace2(request.getOtherFaceIdInOrigami());

        foldEdgeMapper.addByObj(foldEdge);
    }


    private void createSideEdge(long faceId, long edgeId, Long vertex1Id, Long vertex2Id, int idInFace) {
        SideEdge sideEdge = new SideEdge();
        sideEdge.setEdgeId(edgeId);
        sideEdge.setVertex1Id(vertex1Id);
        sideEdge.setVertex2Id(vertex2Id);
        sideEdge.setFaceId(faceId);
        sideEdge.setIdInFace(idInFace);
        sideEdgeMapper.addByObj(sideEdge);
    }


    private List<Long> addVertices(long faceId, long stepId, long pointTypeId, List<VertexRequest> vertices) {
        List<Long> vertexIds = new ArrayList<>();
        for (int i = 0; i < vertices.size(); i++) {
            VertexRequest vertex = vertices.get(i);
            OrigamiPoint point = new OrigamiPoint();
            point.setStepId(stepId);
            point.setFaceId(faceId);
            point.setPointTypeId(pointTypeId);
            point.setXPos(vertex.getX());
            point.setYPos(vertex.getY());
            point.setIdInFace(i);

            origamiPointMapper.addByObj(point);
            Long vertexId = origamiPointMapper.getIdByIdInFace(faceId, i);
            if (vertexId == null) {
                throw new DbException("Cannot find created vertex ID, verify if SQL is correct");
            }
            vertexIds.add(vertexId);
        }
        return vertexIds;
    }


    /**
     * Adds new annotated points to a face.
     * @param faceId The ID of the face.
     * @param stepId The step ID in which the addition occurs.
     * @param pointTypeId The point type ID.
     * @param points List of new points to add.
     * @throws IllegalArgumentException if duplicate points exist.
     */
    private void addAnnotatedPoints(long faceId, long stepId, Long pointTypeId, List<PointAnnotationRequest> points) {
        if (points == null || points.isEmpty()) return;

        // Check for duplicate points
        List<Integer> idsInFace = points.stream().map(PointAnnotationRequest::getIdInFace).toList();
        if (!origamiPointMapper.getIdsByIdsInFace(faceId, idsInFace).isEmpty()) {
            throw new IllegalArgumentException("Duplicate points detected, " +
                    "verify if request is valid (duplicate annotated points).");
        }

        // Insert new points
        for (PointAnnotationRequest pointRequest : points) {
            OrigamiPoint point = new OrigamiPoint();
            point.setStepId(stepId);
            point.setFaceId(faceId);
            point.setPointTypeId(pointTypeId);
            point.setXPos(pointRequest.getX());
            point.setYPos(pointRequest.getY());
            point.setIdInFace(pointRequest.getIdInFace());

            origamiPointMapper.addByObj(point);
            Long pointId = origamiPointMapper.getIdByIdInFace(faceId, pointRequest.getIdInFace());

            // Add corresponding AnnotatedPoint
            AnnotatedPoint annotatedPoint = new AnnotatedPoint();
            annotatedPoint.setPointId(pointId);

            // Check if the point is associated with an edge
            Integer edgeIdInFace = pointRequest.getOnEdgeIdInFace();
            if (edgeIdInFace != null) {
                Long edgeId = edgeMapper.getIdByIdInFace(faceId, edgeIdInFace);
                if (edgeId == null) {
                    throw new IllegalArgumentException("Edge id in face does not match with anything in DB, " +
                            "verify if request is valid (no edge id in face entry in DB)");
                }
                annotatedPoint.setOnEdgeId(edgeId);
            }
            annotatePointMapper.addByObj(annotatedPoint);
        }
    }

    private void addEdges(long origamiId, long faceId, long stepId, List<Long> vertexIds,
                          List<FoldEdgeRequest> foldEdges, Long foldEdgeTypeId, Long sideEdgeTypeId) {
        for (int i = 0; i < vertexIds.size(); i++) {
            Long edgeTypeId = (foldEdges.get(i) != null) ? foldEdgeTypeId : sideEdgeTypeId;
            long edgeId = createEdge(stepId, edgeTypeId);

            if (foldEdges.get(i) != null) {
                createFoldEdge(origamiId, faceId, i, foldEdges.get(i), edgeId);
            } else {
                createSideEdge(faceId, edgeId, vertexIds.get(i), vertexIds.get((i + 1) % vertexIds.size()), i);
            }
        }
    }


    /**
     * Adds new annotated lines to a face.
     * @param faceId The ID of the face.
     * @param stepId The step ID in which the addition occurs.
     * @param lines List of new lines to add.
     */
    private void addAnnotatedLines(long faceId, long stepId, List<LineAnnotationRequest> lines) {
        if (lines == null || lines.isEmpty()) return;

        // TODO: Check if it is an edge

        // Insert new lines
        for (LineAnnotationRequest lineRequest : lines) {
            int point1IdInOrigami = lineRequest.getPoint1IdInOrigami();
            int point2IdInOrigami = lineRequest.getPoint2IdInOrigami();
            List<Integer> points = new ArrayList<>();
            points.add(point1IdInOrigami);
            points.add(point2IdInOrigami);

            List<Long> pointIds = origamiPointMapper.getIdsByIdsInFace(faceId, points);

            // Check if both points exists
            if (pointIds.size() != points.size()) {
                throw new IllegalArgumentException("Invalid point in annotated line " + lineRequest.getIdInFace() +
                        ", verify if request is valid (invalid point in line)");
            }

            AnnotatedLine line = new AnnotatedLine();
            line.setStepId(stepId);
            line.setFaceId(faceId);
            line.setIdInFace(lineRequest.getIdInFace());

            line.setPoint1Id(origamiPointMapper.getIdByIdInFace(faceId, point1IdInOrigami));
            line.setPoint2Id(origamiPointMapper.getIdByIdInFace(faceId, point2IdInOrigami));

            annotateLineMapper.addByObj(line);
        }
    }


    /**
     * Deletes faces from the origami model.
     *
     * @param origamiId The ID of the origami.
     * @param stepId The ID of the current fold step.
     * @param deletedFaceIdsInOrigami List of face IDs to delete.
     * @throws IllegalArgumentException if invalid face IDs are provided.
     */
    private void deleteFaces(long origamiId, long stepId, List<Integer> deletedFaceIdsInOrigami) {
        if (deletedFaceIdsInOrigami == null || deletedFaceIdsInOrigami.isEmpty()) return;

        // Retrieve and delete the specified faces
        List<Long> deletedFaceIds = faceMapper.getIdsByIdsInFace(origamiId, deletedFaceIdsInOrigami);
        int rowsUpdated = faceMapper.deleteByIds(deletedFaceIds, stepId);

        // Validate that the deletion was consistent with the request
        validateDeletion(origamiId, 0, deletedFaceIdsInOrigami, rowsUpdated,
                "face", faceMapper.getIdsByIdsInFace(origamiId, deletedFaceIdsInOrigami));
    }


    /**
     * Deletes annotated points from a face.
     * @param origamiId The ID of the origami.
     * @param faceId The ID of the face.
     * @param stepId The step ID in which the deletion occurs.
     * @param deletedPointIdsInFace List of point IDs in face to delete.
     * @throws IllegalArgumentException if points are referenced by existing lines or do not exist.
     */
    private void deleteAnnotatedPoints(long origamiId, long faceId, Long stepId, List<Integer> deletedPointIdsInFace) {
        if (deletedPointIdsInFace == null || deletedPointIdsInFace.isEmpty()) return;

        // Recover the actual point IDs
        List<Long> deletedPointIds = origamiPointMapper.getIdsByIdsInFace(faceId, deletedPointIdsInFace);

        // Check if list contains vertices
        long pointTypeId = getPointTypeId(PointType.VERTEX);
        List<Long> vertexIds = origamiPointMapper.getIdsOfPointTypeByIds(pointTypeId, deletedPointIds);
        if (!vertexIds.isEmpty()) {
            throw new IllegalArgumentException("Deleted points contains vertices, " +
                    "verify if request is valid (vertex deletion)");
        }

        // Check if any points have dependent lines
        List<Long> dependentLines = annotateLineMapper.getDependentIds(faceId, deletedPointIds);
        if (!dependentLines.isEmpty()) {
            throw new IllegalArgumentException("Dependent lines detected for deleted points, " +
                    "verify if request is valid (line dependency)");
        }

        // Perform deletion
        int rowsUpdated = origamiPointMapper.deleteByIdsInFace(faceId, deletedPointIdsInFace, stepId);

        // Validate the deletion
        validateDeletion(origamiId, faceId, deletedPointIdsInFace, rowsUpdated,
                "annotated point", origamiPointMapper.getIdsByIdsInFace(faceId, deletedPointIdsInFace));
    }


    /**
     * Deletes annotated lines from a face.
     * @param origamiId The ID of the origami.
     * @param faceId The ID of the face.
     * @param stepId The step ID in which the deletion occurs.
     * @param deletedLineIdsInFace List of line IDs in face to delete.
     * @throws IllegalArgumentException if lines do not exist.
     */
    private void deleteAnnotatedLines(long origamiId, long faceId, long stepId, List<Integer> deletedLineIdsInFace) {
        if (deletedLineIdsInFace == null || deletedLineIdsInFace.isEmpty()) return;

        // Perform deletion
        int rowsUpdated = annotateLineMapper.deleteByIdsInFace(faceId, deletedLineIdsInFace, stepId);

        // Validate the deletion
        validateDeletion(origamiId, faceId, deletedLineIdsInFace, rowsUpdated,
                "annotated line", annotateLineMapper.getIdsByIdsInFace(faceId, deletedLineIdsInFace));
    }


    /**
     * Validates whether a deletion operation was successful and raises appropriate exceptions if issues are found.
     * @param origamiId The ID of the origami.
     * @param faceId The ID of the face.
     * @param deletedIds The list of IDs that were attempted to be deleted.
     * @param numUpdatedRows The number of rows successfully deleted.
     * @param entityType A string indicating the type of entity (e.g., "annotated point" or "annotated line").
     * @param presentRows The list of IDs that still exist in the database.
     * @throws IllegalArgumentException if deletion request contains invalid IDs.
     * @throws DbException if an impossible state is reached.
     */
    private void validateDeletion(long origamiId, long faceId, List<Integer> deletedIds,
                                  int numUpdatedRows, String entityType, List<Long> presentRows) {
        if (numUpdatedRows > deletedIds.size()) {
            String errorMessage = "Extra rows are updated after deleting " + entityType + "s, " +
                    "verify if DB is correct (unexpected rows updated)";
            logger.error(errorMessage);
            throw new DbException(errorMessage);
        } else if (numUpdatedRows < deletedIds.size()) {
            if (presentRows.size() > numUpdatedRows) {
                String errorMessage = "Invalid " + entityType + " id(s) found in face id " +
                        faceId + " for origami " + origamiId + ", verify if request is valid (double deletion)";
                logger.error(errorMessage);
                throw new IllegalArgumentException(errorMessage);
            } else if (presentRows.size() == numUpdatedRows) {
                String errorMessage = "Invalid " + entityType + " id(s) found in face id " +
                        faceId + " for origami " + origamiId + ", " +
                        "verify if request is valid (no such " + entityType + ")";
                logger.error(errorMessage);
                throw new IllegalArgumentException(errorMessage);
            } else {
                String errorMessage = "Impossible state reached, " +
                        "verify if backend/DB is correct (delete " + entityType + ")";
                logger.error(errorMessage);
                throw new DbException(errorMessage);
            }
        }
    }

    /**
     * Constructs the initial geometry of a newly created origami.
     * Creates a base face with four vertices and four edges.
     *
     * @param origamiId The ID of the origami for which geometry is built.
     */
    public void buildInitialOrigamiGeometry(long origamiId) {
        long stepId = buildInitialStep(origamiId);

        long faceId = buildInitialFace(origamiId, stepId);

        // Initialize four vertices at the corners.
        buildInitialVertices(stepId, faceId);

        // Create four edges connecting the vertices.
        buildInitialEdges(stepId, faceId);
    }

    /**
     * Creates the initial step for a newly created origami.
     * This step represents the creation event of the origami.
     *
     * @param origamiId The ID of the origami for which the step is created.
     * @return The database ID of the created step.
     * @throws DbException if the step type does not exist in the database.
     */
    private long buildInitialStep(long origamiId) {
        // Retrieve the step type ID from the database.
        String stepType = StepType.CREATE;
        Long stepTypeId = stepTypeMapper.getIdByName(stepType);

        // Create a new step entry in the database.
        Step step = new Step();
        step.setOrigamiId(origamiId);
        step.setStepTypeId(stepTypeId);
        step.setIdInOrigami(0);
        stepMapper.addByObj(step);

        // Retrieve the generated step ID.
        Long stepId = stepMapper.getIdByIdInOrigami(origamiId, 0);

        // Check if step ID is found
        if (stepId == null) {
            throw new DbException("Cannot find step ID that is just created, verify if SQL is correct");
        }

        return stepId;
    }

    /**
     * Creates the initial face of an origami model.
     * This represents the base shape before any modifications.
     *
     * @param origamiId The ID of the origami for which the face is created.
     * @param stepId The ID of the step in which the face is created.
     * @return The database ID of the created face.
     */
    private long buildInitialFace(Long origamiId, Long stepId) {
        // Create a default face associated with the given origami and step.
        Face face = new Face();
        face.setStepId(stepId);
        face.setIdInOrigami(0);  // Default face index (0-based)
        faceMapper.addByObj(face);

        // Retrieve the generated face ID.
        Long faceId = faceMapper.getIdByFaceIdInOrigami(origamiId, 0);

        // Check if step ID is found
        if (faceId == null) {
            throw new DbException("Cannot find face ID that is just created, verify if SQL is correct");
        }

        return faceId;
    }

    /**
     * Creates four initial vertices (corners) for the default face in an origami model.
     * The vertices are arranged in a 3x3 square formation.
     *
     * @param stepId The ID of the step in which the vertices are created.
     * @param faceId The ID of the face to which the vertices belong.
     */
    private void buildInitialVertices(long stepId, long faceId) {
        long pointTypeId = getPointTypeId(PointType.VERTEX);

        for (int i = 0; i < 4; i++) {
            double x = (i == 1 || i == 2) ? 3.0 : -3.0;
            double y = (i == 2 || i == 3) ? 3.0 : -3.0;

            OrigamiPoint vertex = new OrigamiPoint();
            vertex.setStepId(stepId);
            vertex.setFaceId(faceId);
            vertex.setPointTypeId(pointTypeId);
            vertex.setXPos(x);
            vertex.setYPos(y);
            vertex.setIdInFace(i);

            // Store vertex in the database.
            origamiPointMapper.addByObj(vertex);
        }
    }


    /**
     * Creates four initial edges that connect the four vertices of the default face.
     *
     * @param stepId The ID of the step in which the edges are created.
     * @param faceId The ID of the face to which the edges belong.
     */
    private void buildInitialEdges(long stepId, long faceId) {
        // Retrieve the side edge type ID from the database.
        String edgeType = EdgeType.SIDE;
        Long edgeTypeId = edgeTypeMapper.getEdgeTypeByName(edgeType);

        // Check if edge type ID is found
        if (edgeTypeId == null) {
            throw new DbException("Cannot find edge type ID with type name: " + EdgeType.SIDE +
                    ", verify if DB is correctly set up");
        }

        for (int i = 0; i < 4; i++) {
            // Create edge record.
            Edge edge = new Edge();
            edge.setStepId(stepId);
            edge.setEdgeTypeId(edgeTypeId);
            edgeMapper.addByObj(edge);

            // Retrieve the most recently added edge ID.
            Long edgeId = edgeMapper.getMostRecentId(stepId);

            if (edgeId == null) {
                throw new DbException("Cannot find edge ID that is just created, verify if SQL is correct");
            }

            // Associate edge with vertices.
            SideEdge sideEdge = new SideEdge();
            Long vertex1Id = origamiPointMapper.getIdByIdInFace(faceId, i);
            Long vertex2Id = origamiPointMapper.getIdByIdInFace(faceId, (i + 1) % 4);
            sideEdge.setEdgeId(edgeId);
            sideEdge.setVertex1Id(vertex1Id);
            sideEdge.setVertex2Id(vertex2Id);
            sideEdge.setFaceId(faceId);
            sideEdge.setIdInFace(i);

            // Store edge connection in the database.
            sideEdgeMapper.addByObj(sideEdge);
        }
    }
}
