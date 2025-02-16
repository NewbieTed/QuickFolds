package com.quickfolds.backend.geometry.service;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.exception.DbException;
import com.quickfolds.backend.geometry.constants.StepType;
import com.quickfolds.backend.geometry.mapper.AnnotateLineMapper;
import com.quickfolds.backend.geometry.mapper.AnnotatePointMapper;
import com.quickfolds.backend.geometry.mapper.FaceMapper;
import com.quickfolds.backend.geometry.mapper.StepMapper;
import com.quickfolds.backend.geometry.mapper.EdgeMapper;
import com.quickfolds.backend.geometry.model.database.AnnotatedLine;
import com.quickfolds.backend.geometry.model.database.AnnotatedPoint;
import com.quickfolds.backend.geometry.model.database.Step;
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
    private final FaceMapper faceMapper;
    private final EdgeMapper edgeMapper;
    private final AnnotateLineMapper annotateLineMapper;
    private final AnnotatePointMapper annotatePointMapper;


    private static final Logger logger = LoggerFactory.getLogger(GeometryService.class);


    public ResponseEntity<BaseResponse<Boolean>> fold(FoldRequest request) {
//        List<Integer> deletedFaces = request.getDeletedFaces();
//        List<FaceFoldRequest> faces = request.getFaces();
//
//        for (int deleteFaceId : deletedFaces) {
//            // TODO: Implement this SQL code
//            geometryMapper.deleteFaceByIdInOrigami(deleteFaceId);
//        }
        return BaseResponse.success();
    }

    @Transactional
    public ResponseEntity<BaseResponse<Boolean>> annotate(AnnotationRequest request) {
        // Get basic information about the request
        long origamiId = request.getOrigamiId();
        int stepIdInOrigami = request.getStepIdInOrigami();
        List<FaceAnnotateRequest> faces = request.getFaces();

        // TODO: Case overwrite

        logger.info("Starting annotation for origamiId={}, stepIdInOrigami={}", origamiId, stepIdInOrigami);

        // Update annotations for each face
        for (FaceAnnotateRequest face : faces) {
            int faceIdInOrigami = face.getIdInOrigami();
            Annotation annotations = face.getAnnotations();

            // Get the face id of the face
            logger.info("Processing face with idInOrigami={} for origamiId={}", faceIdInOrigami, origamiId);
            long faceId = faceMapper.getIdByFaceIdInOrigami(origamiId, faceIdInOrigami);
            logger.debug("Retrieved faceId={} for origamiId={}, idInOrigami={}", faceId, origamiId, faceIdInOrigami);

            // Get the step type id of the step
            String stepType = StepType.ANNOTATE;
            Long stepTypeId = stepMapper.getStepTypeByName(stepType);

            // Check if there is a valid step
            if (stepTypeId == null) {
                String errorMessage = "Unknown step name: " + stepType + ", verify if DB is correct";
                logger.error(errorMessage);
                throw new DbException(errorMessage);
            }
            logger.debug("Retrieved stepTypeId={} for stepType={}", stepTypeId, stepType);

            // Create new step
            Step newStep = new Step();
            newStep.setOrigamiId(origamiId);
            newStep.setIdInOrigami(stepIdInOrigami);
            newStep.setStepTypeId(stepTypeId);

            Long stepId = stepMapper.addByObj(newStep);
            logger.info("Created new step with stepId={} for origamiId={}", stepId, origamiId);

            // Get annotated lines that needs to be deleted
            List<Integer> deletedLineIdsInFace = annotations.getDeletedLines();
            logger.debug("Deleted lines for faceId={} are: {}", faceId, deletedLineIdsInFace);

            // Check if there are lines to delete
            if (deletedLineIdsInFace != null && !deletedLineIdsInFace.isEmpty()) {
                // There are lines to delete, proceed to deletion
                int numUpdatedRows = annotateLineMapper.deleteMultipleByIdInFace(faceId,
                        deletedLineIdsInFace, stepId);
                logger.debug("Deleted {} rows for annotated lines in faceId={}", numUpdatedRows, faceId);

                // Check if the deletion is correct
                if (numUpdatedRows > deletedLineIdsInFace.size()) {
                    String errorMessage = "Extra rows are updated after deleting annotated lines, verify if DB is correct";
                    logger.error(errorMessage);
                    throw new DbException(errorMessage);
                } else if (numUpdatedRows < deletedLineIdsInFace.size()) {
                    List<Long> presentRows = annotateLineMapper.getMultipleId(faceId, deletedLineIdsInFace);
                    if (presentRows.size() > numUpdatedRows) {
                        String errorMessage = "Invalid annotated line id(s) found in face id " +
                                faceId + " for origami " + origamiId + ", verify if request is valid (double deletion)";
                        logger.error(errorMessage);
                        throw new IllegalArgumentException(errorMessage);
                    } else if (presentRows.size() == numUpdatedRows) {
                        String errorMessage = "Invalid annotated line id(s) found in face id " +
                                faceId + " for origami " + origamiId + ", verify if request is valid (no such annotated line)";
                        logger.error(errorMessage);
                        throw new IllegalArgumentException(errorMessage);
                    } else {
                        String errorMessage = "Impossible state reached, verify backend/DB is correct (delete annotated line)";
                        logger.error(errorMessage);
                        throw new DbException(errorMessage);
                    }
                }
            }

            List<Integer> deletedPointIdsInFace = face.getAnnotations().getDeletedPoints();
            if (deletedPointIdsInFace != null && !deletedPointIdsInFace.isEmpty()) {
                int numUpdatedRows = annotatePointMapper.deleteMultipleByIdInFace(faceId,
                        deletedPointIdsInFace, stepId);
                logger.debug("Deleted points for faceId={}", faceId);

                if (numUpdatedRows > deletedPointIdsInFace.size()) {
                    String errorMessage = "Extra rows are updated after deleting annotated points, verify if DB is correct";
                    logger.error(errorMessage);
                    throw new DbException(errorMessage);
                } else if (numUpdatedRows < deletedPointIdsInFace.size()) {
                    List<Long> presentRows = annotatePointMapper.getMultipleId(faceId, deletedPointIdsInFace);
                    if (presentRows.size() > numUpdatedRows) {
                        String errorMessage = "Invalid annotated point id(s) found in face id " +
                                faceId + " for origami " + origamiId + ", verify if request is valid (double deletion)";
                        logger.error(errorMessage);
                        throw new IllegalArgumentException(errorMessage);
                    } else if (presentRows.size() == numUpdatedRows) {
                        String errorMessage = "Invalid annotated point id(s) found in face id " +
                                faceId + " for origami " + origamiId + ", verify if request is valid (no such annotated point)";
                        logger.error(errorMessage);
                        throw new IllegalArgumentException(errorMessage);
                    } else {
                        String errorMessage = "Impossible state reached, verify backend/DB is correct (delete annotated point)";
                        logger.error(errorMessage);
                        throw new DbException(errorMessage);
                    }
                }
            }

            // TODO: Check if there is duplicated points
            List<PointAnnotationRequest> pointAnnotationRequests = face.getAnnotations().getPoints();

            for (PointAnnotationRequest pointAnnotationRequest : pointAnnotationRequests) {
                AnnotatedPoint point = new AnnotatedPoint();

                Integer edgeIdInFace = pointAnnotationRequest.getOnEdgeIdInFace();
                Long edgeId = null;

                if (edgeIdInFace != null) {
                    // issue: how to get the edge when a point is on an edge
                    edgeId = edgeMapper.getIdByIdInFace(faceId, pointAnnotationRequest.getOnEdgeIdInFace());
                }

                point.setStepId(stepId);
                point.setFaceId(faceId);
                point.setXPos(pointAnnotationRequest.getX());
                point.setYPos(pointAnnotationRequest.getY());
                point.setIdInFace(pointAnnotationRequest.getIdInFace());
                point.setOnEdgeId(edgeId);
                point.setIdInFace(pointAnnotationRequest.getIdInFace());

                point.setCreatedBy(null);
                point.setUpdatedBy(null);

                annotatePointMapper.addByObj(point);
                logger.debug("Added point for faceId={}", faceId);
            }

            // TODO: Check if points are present
            List<LineAnnotationRequest> lineAnnotationRequests = face.getAnnotations().getLines();

            for (LineAnnotationRequest lineAnnotationRequest : lineAnnotationRequests) {
                AnnotatedLine line = new AnnotatedLine();

                Long point1Id = annotatePointMapper.getIdbyIdInFace(faceId,
                        lineAnnotationRequest.getPoint1IdInOrigami());
                Long point2Id = annotatePointMapper.getIdbyIdInFace(faceId,
                        lineAnnotationRequest.getPoint2IdInOrigami());

                line.setStepId(stepId);
                line.setFaceId(faceId);
                line.setPoint1Id(point1Id);
                line.setPoint2Id(point2Id);
                line.setIdInFace(lineAnnotationRequest.getIdInFace());

                line.setCreatedBy(null);
                line.setUpdatedBy(null);

                annotateLineMapper.addByObj(line);
                logger.debug("Added line for faceId={}", faceId);
            }
        }
        return BaseResponse.success();
    }

}
