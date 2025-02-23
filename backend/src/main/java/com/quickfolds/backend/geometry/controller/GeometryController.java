package com.quickfolds.backend.geometry.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.model.dto.AnnotationRequest;
import com.quickfolds.backend.geometry.model.dto.FaceAnnotateRequest;
import com.quickfolds.backend.geometry.model.dto.FoldRequest;
import com.quickfolds.backend.geometry.service.GeometryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for handling geometry-related operations in the origami system.
 * <p>
 * This controller provides endpoints for performing geometric transformations,
 * such as folding and annotating origami structures. It ensures input validation
 * and delegates business logic to {@link GeometryService}.
 * <p>
 * Endpoints:
 * <ul>
 *     <li><strong>POST /geometry/fold:</strong> Handles origami folding operations.</li>
 *     <li><strong>POST /geometry/annotate:</strong> Adds annotations to an origami structure.</li>
 *     <li><strong>GET /geometry/get/step:</strong> Retrieves a specific step in the origami process.</li>
 * </ul>
 * <p>
 * Validation:
 * <ul>
 *     <li>Uses {@code @Valid} to validate incoming request bodies.</li>
 *     <li>Performs additional null and empty checks on {@link #annotate(AnnotationRequest)} requests.</li>
 * </ul>
 *
 * Dependencies:
 * - {@link GeometryService}: Service layer for processing folding and annotation requests.
 */
@RestController
@RequestMapping("/geometry")
@RequiredArgsConstructor
public class GeometryController {

    /**
     * Service layer responsible for executing geometry-related operations.
     */
    private final GeometryService geometryService;

    /**
     * Handles the folding operation for an origami structure.
     * <p>
     * This endpoint receives a {@link FoldRequest} containing the necessary fold instructions.
     * It validates the request, ensures it is not null, and delegates the processing
     * to the {@link GeometryService#fold(FoldRequest)} method.
     *
     * @param request The fold request containing the necessary transformations.
     * @return {@link ResponseEntity} with a {@link BaseResponse} indicating success or failure.
     * @throws IllegalArgumentException If the request body is null.
     */
    @PostMapping("/fold")
    public ResponseEntity<BaseResponse<Boolean>> fold(@Valid @RequestBody FoldRequest request) {
        if (request == null) {
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(), "No request body provided");
        }
        return geometryService.fold(request);
    }

    /**
     * Handles annotation requests for an origami structure.
     * <p>
     * This endpoint receives an {@link AnnotationRequest} containing face annotations.
     * It performs comprehensive validation to ensure that the request includes:
     * <ul>
     *     <li>Non-null origami ID</li>
     *     <li>Non-null step ID</li>
     *     <li>Non-empty list of face annotations</li>
     * </ul>
     * If the validation passes, the request is processed by {@link GeometryService#annotate(AnnotationRequest)}.
     *
     * @param request The annotation request containing face modifications.
     * @return {@link ResponseEntity} with a {@link BaseResponse} indicating success or failure.
     * @throws IllegalArgumentException If the request contains missing or invalid data.
     */
    @PostMapping("/annotate")
    public ResponseEntity<BaseResponse<Boolean>> annotate(@Valid @RequestBody AnnotationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request is null, verify if request is valid (null request)");
        }

        if (request.getOrigamiId() == null) {
            throw new IllegalArgumentException("Origami ID is null, verify if request is valid (null origami ID)");
        }

        if (request.getStepIdInOrigami() == null) {
            throw new IllegalArgumentException("Step ID in origami is null, verify if request is valid (null step ID)");
        }

        List<FaceAnnotateRequest> faces = request.getFaces();
        if (faces == null || faces.isEmpty()) {
            throw new IllegalArgumentException("Faces list is null or empty, verify if request is valid");
        }

        return geometryService.annotate(request, null);
    }

    /**
     * Retrieves a specific step in the origami folding process.
     * <p>
     * This endpoint expects a long value representing the origami ID
     * and an int value representing the step ID in the origami.
     * It insures the parameters are not null, and then delegates the processing
     * to the {@link GeometryService#getStep(long, int)} method.
     *
     * @param origamiId The ID of the origami the step is in.
     * @param stepIdInOrigami The ID of the step to retrieve in the origami.
     * @return {@link ResponseEntity} with a {@link BaseResponse} indicating success.
     */
    @GetMapping("/get/step/{origamiId}/{stepIdInOrigami}")
    public ResponseEntity<BaseResponse<Boolean>> getStep(@PathVariable long origamiId, @PathVariable int stepIdInOrigami) {
        if (origamiId == null) {
            throw new IllegalArgumentException("Origami ID is null, verify if request is valid (null origami ID");
        }

        if (stepIdInOrigami == null) {
            throw new IllegalArgumentException("Step ID in origami is null, verify if request is valid (null step ID in origami)");
        }

        return geometryService.getStep(origamiId, stepIdInOrigami);
    }
}