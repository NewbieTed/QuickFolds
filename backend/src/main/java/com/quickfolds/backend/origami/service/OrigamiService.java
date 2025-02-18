package com.quickfolds.backend.origami.service;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.exception.DbException;
import com.quickfolds.backend.geometry.mapper.*;
import com.quickfolds.backend.geometry.model.database.*;
import com.quickfolds.backend.geometry.service.GeometryService;
import com.quickfolds.backend.origami.mapper.OrigamiMapper;
import com.quickfolds.backend.origami.model.database.Origami;
import com.quickfolds.backend.origami.model.dto.request.NewOrigamiRequest;
import com.quickfolds.backend.origami.model.dto.response.NewOrigamiResponse;
import com.quickfolds.backend.origami.model.dto.response.OrigamiListResponse;
import com.quickfolds.backend.origami.model.dto.response.OrigamiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrigamiService {

    private final OrigamiMapper origamiMapper;
    private final StepTypeMapper stepTypeMapper;
    private final StepMapper stepMapper;
    private final FaceMapper faceMapper;

    private final GeometryService geometryService;

    @Transactional
    public ResponseEntity<BaseResponse<OrigamiListResponse>> list() {

        List<OrigamiResponse> origamis = origamiMapper.getPublicOrigamis();

        if (origamis == null) {
            throw new DbException("Error in DB, cannot get origami data from DB");
        }

        OrigamiListResponse response = new OrigamiListResponse(origamis);

        return BaseResponse.success(response);
    }


    /**
     * Creates a new origami record with a default face.
     * The default face is initialized with four vertices.
     * Each vertex is also annotated with a corresponding annotated point.
     * All coordinates and idInFace values are 0-based while the step ids are 1-based.
     */
    @Transactional
    public ResponseEntity<BaseResponse<NewOrigamiResponse>> newOrigami(NewOrigamiRequest request) {
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

        geometryService.buildInitialOrigamiGeometry(origamiId);

        NewOrigamiResponse response = new NewOrigamiResponse(origamiId);

        return BaseResponse.success(response);
    }
}
