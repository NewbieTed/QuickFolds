package com.quickfolds.backend.origami.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.origami.model.dto.request.NewOrigamiRequest;
import com.quickfolds.backend.origami.model.dto.response.NewOrigamiResponse;
import com.quickfolds.backend.origami.model.dto.response.OrigamiListResponse;
import com.quickfolds.backend.origami.model.dto.response.OrigamiResponse;
import com.quickfolds.backend.origami.service.OrigamiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for handling origami-related operations.
 *
 * - Provides endpoints for creating new origami models and retrieving existing ones.
 * - Delegates business logic to `OrigamiService`.
 *
 * Endpoints:
 * - `/origami/new` (POST): Creates a new origami model.
 * - `/origami/list` (GET): Retrieves all public origami models.
 *
 * Dependencies:
 * - `OrigamiService`: Handles the core origami operations.
 */
@RestController
@RequestMapping("/origami")
@RequiredArgsConstructor
public class OrigamiController {

    /**
     * Service layer responsible for origami-related operations.
     */
    private final OrigamiService origamiService;


    /**
     * Creates a new origami model.
     * <p>
     * - Accepts a request containing user information and optional origami name.
     * - Delegates creation logic to `OrigamiService.newOrigami()`.
     * - Returns the newly created origami ID in a `NewOrigamiResponse`.
     *
     * @param request The request object containing details for creating a new origami.
     * @return ResponseEntity with a `BaseResponse` wrapping a `NewOrigamiResponse`.
     */
    @PostMapping("/new")
    public ResponseEntity<BaseResponse<NewOrigamiResponse>> newOrigami(@Valid @RequestBody NewOrigamiRequest request) {
        return origamiService.newOrigami(request);
    }

    /**
     * Retrieves a list of all public origami models.
     * <p>
     * - Calls `OrigamiService.list()` to fetch available origami models.
     * - Returns a response containing a list of `OrigamiResponse` objects.
     *
     * @return ResponseEntity with a `BaseResponse` wrapping an `OrigamiListResponse`.
     */
    @GetMapping("/list")
    public ResponseEntity<BaseResponse<OrigamiListResponse>> getAll() {
        return origamiService.list();
    }
}
