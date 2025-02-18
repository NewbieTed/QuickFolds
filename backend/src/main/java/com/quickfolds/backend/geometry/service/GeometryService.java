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

@Service
@RequiredArgsConstructor
public class GeometryService {

    private final StepMapper stepMapper;
    private final StepTypeMapper stepTypeMapper;

    private final FaceMapper faceMapper;

    private final EdgeMapper edgeMapper;
    private final SideEdgeMapper sideEdgeMapper;
    private final EdgeTypeMapper edgeTypeMapper;

    private final PointTypeMapper pointTypeMapper;
    private final OrigamiPointMapper origamiPointMapper;
    private final AnnotatePointMapper annotatePointMapper;

    private final AnnotateLineMapper annotateLineMapper;

    private static final Logger logger = LoggerFactory.getLogger(GeometryService.class);

    public ResponseEntity<BaseResponse<Boolean>> fold(FoldRequest request) {
//        List<Integer> deletedFaces = request.getDeletedFaces();
//        List<FaceFoldRequest> faces = request.getFaces();
//
//        for (int deleteFaceId : deletedFaces) {
//            geometryMapper.deleteFaceByIdInOrigami(deleteFaceId);
//        }
        return BaseResponse.success();
    }

    /**
     * Handles annotation requests by adding and deleting annotated points and lines for each face in an origami.
     * @param request The annotation request containing face modifications.
     * @return A success response if the operation is completed.
     */
    @Transactional
    public ResponseEntity<BaseResponse<Boolean>> annotate(AnnotationRequest request) {
        // TODO: Do not delete vertices
        // TODO: Do not delete edges
        long origamiId = request.getOrigamiId();
        int stepIdInOrigami = request.getStepIdInOrigami();

        // TODO: Case overwrite
        logger.info("Starting annotation for origamiId={}, stepIdInOrigami={}", origamiId, stepIdInOrigami);

        Long stepTypeId = stepTypeMapper.getIdByName(StepType.ANNOTATE);
        Long pointTypeId = pointTypeMapper.getIdByName(PointType.ANNOTATED_POINT);

        if (stepTypeId == null) {
            throw new DbException("Unknown step type: " + StepType.ANNOTATE + ", check if DB is set correctly");
        }

        if (pointTypeId == null) {
            throw new DbException("Unknown point type: " + PointType.ANNOTATED_POINT + ", check if DB is set correctly");
        }

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

    public void buildInitialOrigamiGeometry(Long origamiId) {
        Long stepId = buildInitialStep(origamiId);

        Long faceId = buildInitialFace(origamiId, stepId);

        // Create four vertices on the default face.
        buildInitialVertices(stepId, faceId);

        // Create four edges on the default face.
        buildInitialEdges(stepId, faceId);
    }


    public Long buildInitialStep(Long origamiId) {
        // Get the step type id of the step
        String stepType = StepType.CREATE;
        Long stepTypeId = stepTypeMapper.getIdByName(stepType);

        // Create a new step
        Step step = new Step();
        step.setOrigamiId(origamiId);
        step.setStepTypeId(stepTypeId);
        step.setIdInOrigami(0);
        stepMapper.addByObj(step);

        return stepMapper.getIdByIdInOrigami(origamiId, 0);
    }

    public Long buildInitialFace(Long origamiId, Long stepId) {
        // Create a default face for the new origami.
        Face face = new Face();
        face.setOrigamiId(origamiId);
        face.setStepId(stepId);
        face.setIdInOrigami(0);  // Default face index (0-based)
        faceMapper.addByObj(face);

        return faceMapper.getIdByFaceIdInOrigami(origamiId, 0);
    }


    public void buildInitialVertices(Long stepId, Long faceId) {

        String pointType = PointType.VERTEX;
        Long pointTypeId = pointTypeMapper.getIdByName(pointType);

        for (int i = 0; i < 4; i++) {
            double x = 0.0;
            double y = 0.0;

            if (i == 1 || i == 2) {
                x = 3.0;
            }

            if (i == 2 || i == 3) {
                y = 3.0;
            }

            OrigamiPoint vertex = new OrigamiPoint();
            vertex.setStepId(stepId);
            vertex.setFaceId(faceId);
            vertex.setPointTypeId(pointTypeId);
            vertex.setXPos(x);
            vertex.setYPos(y);
            vertex.setIdInFace(i);

            origamiPointMapper.addByObj(vertex);
        }
    }


    public void buildInitialEdges(Long stepId, Long faceId) {
        String edgeType = EdgeType.SIDE;
        Long edgeTypeId = edgeTypeMapper.getEdgeTypeByName(edgeType);

        for (int i = 0; i < 4; i++) {
            // Add basic edge entry
            Edge edge = new Edge();

            edge.setStepId(stepId);
            edge.setEdgeTypeId(edgeTypeId);

            edgeMapper.addByObj(edge);

            Long edgeId = edgeMapper.getMostRecentId(stepId);

            // Add side edge entry
            SideEdge sideEdge = new SideEdge();

            Long vertex1Id = origamiPointMapper.getIdByIdInFace(faceId, i);
            Long vertex2Id = origamiPointMapper.getIdByIdInFace(faceId, (i + 1) % 4);

            sideEdge.setEdgeId(edgeId);
            sideEdge.setVertex1Id(vertex1Id);
            sideEdge.setVertex2Id(vertex2Id);
            sideEdge.setFaceId(faceId);
            sideEdge.setIdInFace(i);

            sideEdgeMapper.addByObj(sideEdge);
        }
    }
}
