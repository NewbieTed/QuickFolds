package com.quickfolds.backend.geometry.service;

import com.quickfolds.backend.dto.BaseResponse;
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
import jakarta.persistence.PersistenceException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GeometryService {

    private final StepMapper stepMapper;
    private final FaceMapper faceMapper;
    private final EdgeMapper edgeMapper;
    private final AnnotateLineMapper annotateLineMapper;
    private final AnnotatePointMapper annotatePointMapper;


    public BaseResponse<Boolean> fold(FoldRequest request) {
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
    public BaseResponse<Boolean> annotate(AnnotationRequest request) {
        long origamiId = request.getOrigamiId();
        int stepIdInOrigami = request.getStepIdInOrigami();
        List<FaceAnnotateRequest> faces = request.getFaces();

        // TODO: Case overwrite


        try {
            for (FaceAnnotateRequest face : faces) {
                int faceIdInOrigami = face.getIdInOrigami();
                Annotation annotations = face.getAnnotations();

                long faceId = faceMapper.getIdByFaceIdInOrigami(origamiId, faceIdInOrigami);

                String stepType = StepType.ANNOTATE;
                Long stepTypeId = stepMapper.getStepTypeByName(stepType);

                if (stepTypeId == null) {
                    return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Unknown step name: " + stepType + ", verify if DB is correct");
                }

                Step newStep = new Step();
                newStep.setOrigamiId(origamiId);
                newStep.setIdInOrigami(stepIdInOrigami);

                Long stepId = stepMapper.addByObj(newStep);

                List<Integer> deletedLinesIdInFace = face.getAnnotations().getDeletedLines();
                int numUpdatedRows = annotateLineMapper.deleteMultipleByIdInFace(faceId,
                        deletedLinesIdInFace, stepId);
                if (numUpdatedRows > deletedLinesIdInFace.size()) {
                    return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Extra rows are updated after deleting annotated lines, verify if DB is correct");
                } else if (numUpdatedRows < deletedLinesIdInFace.size()) {
                    List<Long> presentRows = annotateLineMapper.getMultipleId(faceId, deletedLinesIdInFace);
                    if (presentRows.size() > numUpdatedRows) {
                        return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(),
                                "Invalid annotated line id(s) found in face id " +
                                        faceId + " for origami" + origamiId +
                                        ", verify if request is valid (double deletion)");
                    } else if (presentRows.size() == numUpdatedRows) {
                        return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(),
                                "Invalid annotated line id(s) found in face id " +
                                        faceId + " for origami" + origamiId +
                                        ", verify if request is valid (no such annotated line)");
                    } else {
                        return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Impossible state reached, verify backend/DB is " +
                                        "correct (delete annotated line)");
                    }
                }


                // TODO: Check if lines are present
                annotatePointMapper.deleteMultipleByIdInFace(faceId,
                        face.getAnnotations().getDeletedPoints(), stepId);

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
                }
            }
        } catch (PersistenceException e) {
            return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "SQL error occurred: " + e.getMessage());
        } catch (Exception e) {
            return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Unexpected error occurred: " + e.getMessage());
        }
        return BaseResponse.success();
    }

}
