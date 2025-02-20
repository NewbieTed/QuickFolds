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

/**
 * Service class responsible for handling operations related to Origami entities.
 * This class provides functionality to retrieve public origami records and create new origami structures.
 *
 * Dependencies:
 * - OrigamiMapper: Handles database interactions for origami entities.
 * - StepTypeMapper, StepMapper, FaceMapper: Used for step and face-related database interactions.
 * - GeometryService: Handles geometric operations for origami.
 *
 * This service supports transactional operations to ensure data consistency.
 */
@Service
@RequiredArgsConstructor
public class OrigamiService {

    // Data mapper for Origami entity, handling database operations.
    private final OrigamiMapper origamiMapper;

    // Service for handling geometric operations and transformations in origami.
    private final GeometryService geometryService;

    /**
     * Retrieves a list of all public origami models from the database.
     *
     * @return ResponseEntity containing a BaseResponse with an OrigamiListResponse,
     *         which includes a list of public origami records.
     * @throws DbException if an error occurs while retrieving data from the database.
     */
    @Transactional
    public ResponseEntity<BaseResponse<OrigamiListResponse>> list() {

        // Fetch the list of public origami records from the database.
        List<OrigamiResponse> origamis = origamiMapper.getPublicOrigamis();

        // If retrieval fails, throw an exception to indicate a database issue.
        if (origamis == null) {
            throw new DbException("Error in DB, cannot get origami data from DB");
        }

        // Wrap the retrieved origami data in a response object.
        OrigamiListResponse response = new OrigamiListResponse(origamis);

        return BaseResponse.success(response);
    }


    /**
     * Creates a new origami record with an initial default face and geometry.
     * The default face is initialized with four vertices, each having an annotated point.
     *
     * @param request The request object containing the user ID and optional origami name.
     * @return ResponseEntity containing a BaseResponse with the new origami's ID.
     */
    @Transactional
    public ResponseEntity<BaseResponse<NewOrigamiResponse>> newOrigami(NewOrigamiRequest request) {
        // Extract user ID and origami name from the request.
        Long userId = request.getUserId();
        String origamiName = request.getOrigamiName();

        // Create a new Origami record.
        Origami origami = new Origami();

        // TODO: Verify if the user exists before proceeding.
        origami.setUserId(userId);

        // If the origami name is not provided, assign a default name "Untitled".
        origami.setOrigamiName(origamiName == null ? "Untitled" : origamiName);

        // Set default properties for a newly created origami model.
        origami.setPublic(false);
        origami.setRatings(0.0);

        // Insert the new origami record into the database.
        origamiMapper.addByObj(origami);

        // Retrieve the ID of the most recently created origami for the user.
        Long origamiId = origamiMapper.getMostRecentId(userId);

        if (origamiId == null) {
            throw new DbException("Cannot find origami ID that is just created, verify if SQL is correct");
        }

        // Initialize the geometry structure for the new origami structure.
        geometryService.buildInitialOrigamiGeometry(origamiId);

        // Wrap the newly created origami ID in a response object.
        NewOrigamiResponse response = new NewOrigamiResponse(origamiId);

        return BaseResponse.success(response);
    }
}
