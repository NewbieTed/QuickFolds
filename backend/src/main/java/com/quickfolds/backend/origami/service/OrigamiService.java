package com.quickfolds.backend.origami.service;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.exception.DbException;
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
 * <p>
 * This class provides functionality to retrieve public origami records and create new origami structures.
 * It facilitates communication between controllers and mappers while ensuring transactional integrity.
 * <p>
 * Dependencies:
 * <ul>
 *     <li>{@link OrigamiMapper}: Handles database interactions for origami entities.</li>
 *     <li>{@link GeometryService}: Manages geometric structures associated with origami models.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class OrigamiService {

    /**
     * Data mapper for Origami entity, handling database operations.
     */
    private final OrigamiMapper origamiMapper;

    /**
     * Service for handling geometric operations and transformations in origami models.
     */
    private final GeometryService geometryService;

    /**
     * Retrieves a list of all public origami models from the database.
     * <p>
     * This method fetches all origami models marked as "public" and returns them
     * as a structured response. If no records are found, an empty list is returned.
     *
     * @return ResponseEntity containing a {@link BaseResponse} with an {@link OrigamiListResponse}.
     *         This response includes a list of public origami records.
     * @throws DbException if an error occurs while retrieving data from the database.
     */
    @Transactional
    public ResponseEntity<BaseResponse<OrigamiListResponse>> list() {

        // Fetch the list of public origami records from the database.
        List<OrigamiResponse> origamis = origamiMapper.getPublicOrigamis();

        // If retrieval fails, throw an exception indicating a database issue.
        if (origamis == null) {
            throw new DbException("Error in DB, cannot get origami data from DB");
        }

        // Wrap the retrieved origami data in a response object.
        OrigamiListResponse response = new OrigamiListResponse(origamis);

        // Return the successful response.
        return BaseResponse.success(response);
    }

    /**
     * Creates a new origami record with an initial default face and geometry.
     * <p>
     * This method generates a new origami model associated with the provided user ID and
     * optional origami name. If no name is provided, a default name ("Untitled") is assigned.
     * Upon successful creation, the method initializes the geometric structure for the origami
     * and returns the ID of the newly created model.
     *
     * @param request The request object containing the user ID and optional origami name.
     * @return ResponseEntity containing a {@link BaseResponse} with the new origami's ID,
     *         wrapped in a {@link NewOrigamiResponse}.
     * @throws DbException if the origami creation fails or if the ID cannot be retrieved.
     */
    @Transactional
    public ResponseEntity<BaseResponse<NewOrigamiResponse>> newOrigami(NewOrigamiRequest request) {
        // Extract user ID and create a new origami object.
        Long userId = request.getUserId();
        Origami origami = createOrigami(request, userId);

        // Insert the new origami record into the database.
        origamiMapper.addByObj(origami);

        // Retrieve the ID of the most recently created origami for the user.
        Long origamiId = origamiMapper.getMostRecentId(userId);

        // If the origami ID cannot be retrieved, throw an exception.
        if (origamiId == null) {
            throw new DbException("Cannot find origami ID that is just created, verify if SQL is correct");
        }

        // Initialize the geometry structure for the new origami.
        geometryService.buildInitialOrigamiGeometry(origamiId);

        // Wrap the newly created origami ID in a response object.
        NewOrigamiResponse response = new NewOrigamiResponse(origamiId);

        // Return the success response.
        return BaseResponse.success(response);
    }

    /**
     * Creates an Origami object from the request data.
     * <p>
     * This helper method initializes an {@link Origami} entity with the user ID, origami name,
     * and default properties such as public visibility set to false and ratings set to 0.0.
     *
     * @param request The request object containing the user ID and origami name.
     * @param userId  The ID of the user creating the origami.
     * @return The initialized {@link Origami} object ready for insertion.
     */
    private Origami createOrigami(NewOrigamiRequest request, Long userId) {
        String origamiName = request.getOrigamiName();

        // Create and initialize a new Origami entity.
        Origami origami = new Origami();
        origami.setUserId(userId);
        origami.setOrigamiName(origamiName == null ? "Untitled" : origamiName);
        origami.setPublic(true);
        origami.setRatings(0.0);

        return origami;
    }
}