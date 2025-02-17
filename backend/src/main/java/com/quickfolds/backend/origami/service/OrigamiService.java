package com.quickfolds.backend.origami.service;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.constants.EdgeType;
import com.quickfolds.backend.geometry.constants.PointType;
import com.quickfolds.backend.geometry.mapper.*;
import com.quickfolds.backend.geometry.model.database.Edge;
import com.quickfolds.backend.geometry.model.database.Face;
import com.quickfolds.backend.geometry.model.database.OrigamiPoint;
import com.quickfolds.backend.geometry.model.database.SideEdge;
import com.quickfolds.backend.origami.mapper.OrigamiMapper;
import com.quickfolds.backend.origami.model.Origami;
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
    private final FaceMapper faceMapper;
    private final PointTypeMapper pointTypeMapper;
    private final OrigamiPointMapper origamiPointMapper;
    private final EdgeTypeMapper edgeTypeMapper;
    private final EdgeMapper edgeMapper;

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
    public ResponseEntity<BaseResponse<Boolean>> newOrigami() {
        long creationStepId = 0L; // step ids are 0-based

        // Create a new Origami record.
        Origami origami = new Origami();

        // TODO: Add user
        origami.setUserId(0L); // Use default value or extract from security context if needed.
        origami.setPublic(false); // Updated as requested.
        origami.setRatings(0.0);
        origamiMapper.addByObj(origami);

        // Create a default face for the new origami.
        Face face = new Face();
        face.setOrigamiId(origami.getId());
        face.setStepId(creationStepId);
        face.setIdInOrigami(0);  // Default face index (0-based)
        faceMapper.addByObj(face);
        // faceMapper.insert will update face with its generated id

        // Create four vertices and corresponding annotated points on the default face.
        buildInitialVertices(face.getId()); // TODO: Use sql instead


        buildInitialEdges(face.getId());

        // TODO: return new origami id
        return BaseResponse.success();
    }


    public void buildInitialVertices(Long faceId) {

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
            vertex.setStepId(0L);
            vertex.setFaceId(faceId);
            vertex.setPointTypeId(pointTypeId);
            vertex.setXPos(x);
            vertex.setYPos(y);
            vertex.setIdInFace(i);

            origamiPointMapper.addByObj(vertex);
        }
    }


    public void buildInitialEdges(Long faceId) {

        String edgeType = EdgeType.SIDE;
        Long edgeTypeId = edgeTypeMapper.getEdgeTypeByName(edgeType);


        for (int i = 0; i < 4; i++) {
            // Add basic edge entry
            Edge edge = new Edge();

            edge.setStepId(0L);
            edge.setEdgeTypeId(edgeTypeId);

            edgeMapper.addByObj(edge);

            // TODO: Get edge id

            // Add side edge entry
            SideEdge sideEdge = new SideEdge();

            sideEdge.setVertex1Id((long) i);
            sideEdge.setVertex1Id((long) i + 1);
        }
    }
}
