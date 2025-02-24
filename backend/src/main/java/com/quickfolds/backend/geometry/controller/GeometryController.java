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
     * Retrieves necessary data to go forward or backward one step in the origami folding process.
     * <p>
     * This endpoint expects a long value representing the origami ID,
     * an int value representing the step ID in the origami of the starting step,
     * an int value representing the step ID in the origmi of the ending step,
     * and a boolean value indicating if the step is going forward.
     * It verifies that:
     * <ul>
     *     <li>the parameters are not null</li>
     *     <li>startStep and endStep are exactly 1 appart</li>
     *     <li>startStep < endStep if isForward = true</li>
     *     <li>startStep > endStep if isForward = false</li>
     * </ul>
     * If verification succeeds, delegates processing to {@link GeometryService#getStep(long, int, int, boolean)}.
     *
     * @param origamiId The ID of the origami the step is in.
     * @param startStep The ID in the origami of the starting step.
     * @param endStep The ID in the origami of the ending step.
     * @param isForward Indicates if the step is going forward or not.
     * @return {@link ResponseEntity} with a {@link BaseResponse} indicating success.
     */
    @GetMapping("/getStep/{origamiId}/{startStep}/{endStep}/{isForward}")
    public ResponseEntity<BaseResponse<Boolean>> getStep(@PathVariable long origamiId,
                                                         @PathVariable int startStep,
                                                         @PathVariable int endStep, @PathVariable boolean isForward) {
        if (origamiId == null) {
            throw new IllegalArgumentException("Origami ID is null, this should not be possible");
        }

        if (startStep == null) {
            throw new IllegalArgumentException("Starting step ID in origami is null, this should not be possible");
        }

        if (endStep == null) {
            throw new IllegalArgumentException("Ending step ID in origami is null, this should not be possible");
        }

        if (isForward == null) {
            throw new IllegalArgumentException("Starting step ID in origami is null, this should not be possible");
        }

        int a = Math.abs(startStep - endStep);
        if (a != 1) {
            throw new IllegalArgumentException("Can only go between 1 step at a time. Tried to go between " + a + " steps");
        }

        if (startStep > endStep && isForward == true) {
            throw new IllegalArgumentException("Start step cannot be greater than end step when going forward");
        }

        if (startStep < endStep && isForward == false) {
            throw new IllegalArgumentException("Start step cannot be less than end step when going backward");
        }

        return geometryService.getStep(origamiId, startStep, endStep, isForward);
    }
}