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

import java.util.List;


/**
 * Service class responsible for managing geometric operations in the origami system.
 * This includes creating initial geometry, handling annotation requests,
 * and managing face, edge, and point modifications.
 *
 * Dependencies:
 * - Mappers for database operations (FaceMapper, EdgeMapper, StepMapper, etc.).
 * - Uses transactional operations for consistency.
 *
 * Logging:
 * - Utilizes SLF4J for logging important actions and errors.
 */
@Service
@RequiredArgsConstructor
public class GeometryService {

    // Data mappers responsible for retrieving and modifying step-related data.
    private final StepMapper stepMapper;
    private final StepTypeMapper stepTypeMapper;

    // Mapper for handling faces (polygonal regions) in an origami structure.
    private final FaceMapper faceMapper;

    // Mappers for handling edges and their relationships in origami.
    private final EdgeMapper edgeMapper;
    private final SideEdgeMapper sideEdgeMapper;
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
     * Handles the folding process by updating and removing faces as necessary.
     *
     * @param request The request object containing the faces to delete and the new faces to add.
     * @return ResponseEntity with a BaseResponse indicating success.
     */
    public ResponseEntity<BaseResponse<Boolean>> fold(FoldRequest request) {
        // TODO: Implement deletion of faces and creation of new ones based on fold operation.
        return BaseResponse.success();
    }

    /**
     * Processes an annotation request, handling points and lines on origami faces.
     * Supports addition and deletion of annotations.
     *
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
        // TODO: Do not delete vertices
        // TODO: Do not delete edges
        // Extract origami and step information.
        long origamiId = request.getOrigamiId();
        int stepIdInOrigami = request.getStepIdInOrigami();

        // TODO: Case overwrite
        logger.info("Starting annotation for origamiId={}, stepIdInOrigami={}", origamiId, stepIdInOrigami);

        // Retrieve step type ID for annotation.
        Long stepTypeId = stepTypeMapper.getIdByName(StepType.ANNOTATE);
        if (stepTypeId == null) {
            throw new DbException("Unknown step type: " + StepType.ANNOTATE + ", check if DB is set correctly");
        }

        // Retrieve point type ID for annotated points.
        Long pointTypeId = pointTypeMapper.getIdByName(PointType.ANNOTATED_POINT);
        if (pointTypeId == null) {
            throw new DbException("Unknown point type: " + PointType.ANNOTATED_POINT + ", check if DB is set correctly");
        }

        // Process each face annotation in the request.
        for (FaceAnnotateRequest face : request.getFaces()) {
            // TODO: Check for null for wrappers
            long faceId = getFaceId(origamiId, face.getIdInOrigami());
            Long stepId = createStep(origamiId, stepTypeId, stepIdInOrigami);

            deleteAnnotatedLines(origamiId, faceId, stepId, face.getAnnotations().getDeletedLines());
            deleteAnnotatedPoints(origamiId, faceId, stepId, face.getAnnotations().getDeletedPoints());
            addAnnotatedPoints(faceId, stepId, pointTypeId, face.getAnnotations().getPoints());
            addAnnotatedLines(faceId, stepId, face.getAnnotations().getLines());
        }

        return BaseResponse.success();
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
        return faceMapper.getIdByFaceIdInOrigami(origamiId, faceIdInOrigami);
    }

    /**
     * Creates a new step in the annotation process for an origami.
     * @param origamiId The ID of the origami.
     * @param stepTypeId The step type identifier.
     * @param stepIdInOrigami The step number in the origami.
     * @return The database ID of the newly created step.
     */
    private Long createStep(long origamiId,Long stepTypeId, int stepIdInOrigami) {
        Step step = new Step();
        step.setOrigamiId(origamiId);
        step.setStepTypeId(stepTypeId);
        step.setIdInOrigami(stepIdInOrigami);
        stepMapper.addByObj(step);
        return stepMapper.getIdByIdInOrigami(origamiId, stepIdInOrigami);
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
        List<Long> deletedPointIds = origamiPointMapper.getIdsByIdInFace(faceId, deletedPointIdsInFace);

        // TODO: Check if list contains vertices

        // Check if any points have dependent lines
        List<Long> dependentLines = annotateLineMapper.getDependentIds(faceId, deletedPointIds);
        if (!dependentLines.isEmpty()) {
            throw new IllegalArgumentException("Dependent lines detected for deleted points, " +
                    "verify if request is valid (line dependency)");
        }

        // Perform deletion
        int rowsUpdated = origamiPointMapper.deleteMultipleByIdInFace(faceId, deletedPointIdsInFace, stepId);

        // Validate the deletion
        validateDeletion(origamiId, faceId, deletedPointIdsInFace, rowsUpdated,
                "annotated point", origamiPointMapper.getIdsByIdInFace(faceId, deletedPointIdsInFace));
    }


    /**
     * Deletes annotated lines from a face.
     * @param origamiId The ID of the origami.
     * @param faceId The ID of the face.
     * @param stepId The step ID in which the deletion occurs.
     * @param deletedLineIdsInFace List of line IDs in face to delete.
     * @throws IllegalArgumentException if lines do not exist.
     */
    private void deleteAnnotatedLines(long origamiId, long faceId, Long stepId, List<Integer> deletedLineIdsInFace) {
        if (deletedLineIdsInFace == null || deletedLineIdsInFace.isEmpty()) return;

        // Perform deletion
        int rowsUpdated = annotateLineMapper.deleteMultipleByIdInFace(faceId, deletedLineIdsInFace, stepId);

        // Validate the deletion
        validateDeletion(origamiId, faceId, deletedLineIdsInFace, rowsUpdated,
                "annotated line", annotateLineMapper.getsIdsByIdInFace(faceId, deletedLineIdsInFace));
    }


    /**
     * Adds new annotated points to a face.
     * @param faceId The ID of the face.
     * @param stepId The step ID in which the addition occurs.
     * @param pointTypeId The point type ID.
     * @param points List of new points to add.
     * @throws IllegalArgumentException if duplicate points exist.
     */
    private void addAnnotatedPoints(long faceId, Long stepId, Long pointTypeId, List<PointAnnotationRequest> points) {
        if (points == null || points.isEmpty()) return;

        // Check for duplicate points
        List<Integer> idsInFace = points.stream().map(PointAnnotationRequest::getIdInFace).toList();
        if (!origamiPointMapper.getIdsByIdInFace(faceId, idsInFace).isEmpty()) {
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


    /**
     * Adds new annotated lines to a face.
     * @param faceId The ID of the face.
     * @param stepId The step ID in which the addition occurs.
     * @param lines List of new lines to add.
     */
    private void addAnnotatedLines(long faceId, Long stepId, List<LineAnnotationRequest> lines) {
        if (lines == null || lines.isEmpty()) return;

        // TODO: Check if points are present
        // Insert new lines
        for (LineAnnotationRequest lineRequest : lines) {
            AnnotatedLine line = new AnnotatedLine();
            line.setStepId(stepId);
            line.setFaceId(faceId);
            line.setIdInFace(lineRequest.getIdInFace());

            // TODO: Check if exists
            line.setPoint1Id(origamiPointMapper.getIdByIdInFace(faceId, lineRequest.getPoint1IdInOrigami()));
            line.setPoint2Id(origamiPointMapper.getIdByIdInFace(faceId, lineRequest.getPoint2IdInOrigami()));

            annotateLineMapper.addByObj(line);
        }
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
            String errorMessage = "Extra rows are updated after deleting " + entityType + "s, verify if DB is correct";
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
                        "verify backend/DB is correct (delete " + entityType + ")";
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
    public void buildInitialOrigamiGeometry(Long origamiId) {
        Long stepId = buildInitialStep(origamiId);

        Long faceId = buildInitialFace(origamiId, stepId);

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
    public Long buildInitialStep(Long origamiId) {
        // Retrieve the step type ID from the database.
        String stepType = StepType.CREATE;
        Long stepTypeId = stepTypeMapper.getIdByName(stepType);

        // Create a new step entry in the database.
        Step step = new Step();
        step.setOrigamiId(origamiId);
        step.setStepTypeId(stepTypeId);
        step.setIdInOrigami(0);
        stepMapper.addByObj(step);

        // Retrieve and return the generated step ID.
        return stepMapper.getIdByIdInOrigami(origamiId, 0);
    }

    /**
     * Creates the initial face of an origami model.
     * This represents the base shape before any modifications.
     *
     * @param origamiId The ID of the origami for which the face is created.
     * @param stepId The ID of the step in which the face is created.
     * @return The database ID of the created face.
     */
    public Long buildInitialFace(Long origamiId, Long stepId) {
        // Create a default face associated with the given origami and step.
        Face face = new Face();
        face.setOrigamiId(origamiId);
        face.setStepId(stepId);
        face.setIdInOrigami(0);  // Default face index (0-based)
        faceMapper.addByObj(face);

        // Retrieve and return the generated face ID.
        return faceMapper.getIdByFaceIdInOrigami(origamiId, 0);
    }

    /**
     * Creates four initial vertices (corners) for the default face in an origami model.
     * The vertices are arranged in a 3x3 square formation.
     *
     * @param stepId The ID of the step in which the vertices are created.
     * @param faceId The ID of the face to which the vertices belong.
     */
    public void buildInitialVertices(Long stepId, Long faceId) {
        // Retrieve the vertex point type ID from the database.
        String pointType = PointType.VERTEX;
        Long pointTypeId = pointTypeMapper.getIdByName(pointType);

        for (int i = 0; i < 4; i++) {
            double x = (i == 1 || i == 2) ? 3.0 : 0.0;
            double y = (i == 2 || i == 3) ? 3.0 : 0.0;

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
    public void buildInitialEdges(Long stepId, Long faceId) {
        // Retrieve the side edge type ID from the database.
        String edgeType = EdgeType.SIDE;
        Long edgeTypeId = edgeTypeMapper.getEdgeTypeByName(edgeType);

        for (int i = 0; i < 4; i++) {
            // Create edge record.
            Edge edge = new Edge();
            edge.setStepId(stepId);
            edge.setEdgeTypeId(edgeTypeId);
            edgeMapper.addByObj(edge);

            // Retrieve the most recently added edge ID.
            Long edgeId = edgeMapper.getMostRecentId(stepId);

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
