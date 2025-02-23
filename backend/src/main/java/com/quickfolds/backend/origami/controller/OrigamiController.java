package com.quickfolds.backend.origami.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.origami.model.dto.request.NewOrigamiRequest;
import com.quickfolds.backend.origami.model.dto.response.NewOrigamiResponse;
import com.quickfolds.backend.origami.model.dto.response.OrigamiListResponse;
import com.quickfolds.backend.origami.service.OrigamiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for handling origami-related operations.
 * <p>
 * This controller provides API endpoints for managing origami models, including
 * creating new models and retrieving existing ones. It acts as the interface
 * between the client and the business logic handled by {@link OrigamiService}.
 * <p>
 * Endpoints:
 * <ul>
 *     <li><strong>POST /origami/new:</strong> Creates a new origami model.</li>
 *     <li><strong>GET /origami/list:</strong> Retrieves all public origami models.</li>
 * </ul>
 * <p>
 * Dependencies:
 * - {@link OrigamiService}: Handles the core business logic for origami operations.
 */
@RestController
@RequestMapping("/origami")
@RequiredArgsConstructor
public class OrigamiController {

    /**
     * Service layer responsible for origami-related operations.
     * <p>
     * This service handles the core logic for creating and retrieving origami models.
     */
    private final OrigamiService origamiService;

    /**
     * Creates a new origami model.
     * <p>
     * This endpoint allows users to create a new origami model by providing user information
     * and an optional name for the origami. The request is validated, and the creation logic
     * is handled by {@link OrigamiService#newOrigami(NewOrigamiRequest)}.
     *
     * @param request The request object containing details for creating a new origami.
     *                Must be valid according to the constraints defined in {@link NewOrigamiRequest}.
     * @return {@link ResponseEntity} containing a {@link BaseResponse} with the created origami details,
     *         wrapped in a {@link NewOrigamiResponse}.
     */
    @PostMapping("/new")
    public ResponseEntity<BaseResponse<NewOrigamiResponse>> newOrigami(@Valid @RequestBody NewOrigamiRequest request) {
        return origamiService.newOrigami(request);
    }

    /**
     * Retrieves a list of all public origami models.
     * <p>
     * This endpoint fetches all available origami models that are marked as public.
     * The request is processed by {@link OrigamiService#list()} and returns
     * the results in an {@link OrigamiListResponse}.
     *
     * @return {@link ResponseEntity} containing a {@link BaseResponse} with a list of origami models,
     *         wrapped in an {@link OrigamiListResponse}.
     */
    @GetMapping("/list")
    public ResponseEntity<BaseResponse<OrigamiListResponse>> getAll() {
        return origamiService.list();
    }
}