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



    public void fold(FoldRequest request) {
//        List<Integer> deletedFaces = request.getDeletedFaces();
//        List<FaceFoldRequest> faces = request.getFaces();
//
//        for (int deleteFaceId : deletedFaces) {
//            // TODO: Implement this SQL code
//            geometryMapper.deleteFaceByIdInOrigami(deleteFaceId);
//        }

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
                            "Unknown step name: " + stepType + ", verify if db is correct");
                }

                // TODO: Change to add by object
                Long stepId = stepMapper.addByFields(origamiId,
                        stepTypeId, stepIdInOrigami, null, null);

                // TODO: SQL section
                annotateLineMapper.deleteMultipleByIdInFace(faceId,
                        face.getAnnotations().getDeletedLines(), stepId);

                // TODO: Check if lines are present
                annotatePointMapper.deleteMultipleByIdInFace(faceId,
                        face.getAnnotations().getDeletedPoints(), stepId);





                List<PointAnnotationRequest> pointAnnotationRequests = face.getAnnotations().getPoints();

                for (PointAnnotationRequest pointAnnotationRequest : pointAnnotationRequests) {
                    AnnotatedPoint point = new AnnotatedPoint();

                    long edgeId = edgeMapper.getIdByIdInFace(faceId, pointAnnotationRequest.getOnEdgeIdInFace());

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
                            lineAnnotationRequest.getPointIdInOrigami1());
                    Long point2Id = annotatePointMapper.getIdbyIdInFace(faceId,
                            lineAnnotationRequest.getPointIdInOrigami2());

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
                    "SQL error occurred" + e.getMessage());
        } catch (Exception e) {
            return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Unexpected error occurred" + e.getMessage());
        }
        return BaseResponse.success();
    }

}
