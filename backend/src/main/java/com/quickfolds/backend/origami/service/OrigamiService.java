package com.quickfolds.backend.origami.service;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.constants.EdgeType;
import com.quickfolds.backend.geometry.constants.PointType;
import com.quickfolds.backend.geometry.constants.StepType;
import com.quickfolds.backend.geometry.mapper.*;
import com.quickfolds.backend.geometry.model.database.*;
import com.quickfolds.backend.origami.mapper.OrigamiMapper;
import com.quickfolds.backend.origami.model.database.Origami;
import com.quickfolds.backend.origami.model.dto.NewOrigamiRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrigamiService {

    private final OrigamiMapper origamiMapper;
    private final StepTypeMapper stepTypeMapper;
    private final StepMapper stepMapper;
    private final FaceMapper faceMapper;
    private final PointTypeMapper pointTypeMapper;
    private final OrigamiPointMapper origamiPointMapper;
    private final EdgeTypeMapper edgeTypeMapper;
    private final EdgeMapper edgeMapper;
    private final SideEdgeMapper sideEdgeMapper;

    @Transactional
    public ResponseEntity<BaseResponse<List<Long>>> list() {

        List<Long> ids = origamiMapper.getPublicOrigamiIds();

        if (ids == null) {
            return BaseResponse.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Error getting data from database");
        }

        return BaseResponse.success(ids);
    }


    /**
     * Creates a new origami record with a default face.
     * The default face is initialized with four vertices.
     * Each vertex is also annotated with a corresponding annotated point.
     * All coordinates and idInFace values are 0-based while the step ids are 1-based.
     */
    @Transactional
    public ResponseEntity<BaseResponse<Long>> newOrigami(NewOrigamiRequest request) {
        Long userId = request.getUserId();
        String origamiName = request.getOrigamiName();


        // Create a new Origami record.
        Origami origami = new Origami();

        // TODO: Verify if user is present

        origami.setUserId(userId);
        origami.setOrigamiName(origamiName == null ? "Untitled" : origamiName);
        origami.setPublic(false);
        origami.setRatings(0.0);
        origamiMapper.addByObj(origami);

        Long origamiId = origamiMapper.getMostRecentId(userId);

        // Get the step type id of the step
        String stepType = StepType.FOLD;
        Long stepTypeId = stepTypeMapper.getStepTypeByName(stepType);

        // Create a new step
        Step step = new Step();
        step.setOrigamiId(origamiId);
        step.setStepTypeId(stepTypeId);
        step.setIdInOrigami(0);
        stepMapper.addByObj(step);
        Long stepId = stepMapper.getIdByIdInOrigami(origamiId, 0);

        // Create a default face for the new origami.
        Face face = new Face();
        face.setOrigamiId(origamiId);
        face.setStepId(stepId);
        face.setIdInOrigami(0);  // Default face index (0-based)
        faceMapper.addByObj(face);

        Long faceId = faceMapper.getIdByFaceIdInOrigami(origamiId, 0);

        // Create four vertices on the default face.
        buildInitialVertices(stepId, faceId);

        buildInitialEdges(stepId, faceId);

        return BaseResponse.success(origamiId);
    }


    public void buildInitialVertices(Long stepId, Long faceId) {

        String pointType = PointType.VERTEX;
        Long pointTypeId = pointTypeMapper.getPointTypeByName(pointType);

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
