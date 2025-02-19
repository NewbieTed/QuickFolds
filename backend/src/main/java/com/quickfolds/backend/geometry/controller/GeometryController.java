package com.quickfolds.backend.geometry.controller;

import com.quickfolds.backend.dto.BaseResponse;
import com.quickfolds.backend.geometry.mapper.GeometryMapper;
import com.quickfolds.backend.geometry.model.dto.AnnotationRequest;
import com.quickfolds.backend.geometry.model.dto.FoldRequest;
import com.quickfolds.backend.geometry.service.GeometryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


/**
 * REST controller for handling geometry-related operations in the origami system.
 *
 * Endpoints:
 * - `/geometry/fold` (GET): Handles origami folding operations.
 * - `/geometry/annotate` (POST): Adds annotations to an origami structure.
 * - `/geometry/get/step` (GET): Retrieves a specific step in the origami process.
 *
 * Dependencies:
 * - `GeometryService`: Service layer that processes folding and annotation requests.
 *
 * Validation:
 * - Uses `@Valid` to validate incoming request bodies.
 * - Performs additional null and empty checks on `annotate()` requests.
 */
@RestController
@RequestMapping("/geometry")
@RequiredArgsConstructor
public class GeometryController {
    // Service layer responsible for executing geometry-related operations.
    private final GeometryService geometryService;

    /**
     * Handles the folding operation for an origami structure.
     *
     * - Expects a `FoldRequest` containing the necessary fold instructions.
     * - Returns an error if the request body is missing.
     * - Delegates the request to `GeometryService.fold()`.
     *
     * @param request The fold request containing the necessary transformations.
     * @return ResponseEntity with a BaseResponse indicating success or failure.
     */
    @GetMapping("/fold")
    public ResponseEntity<BaseResponse<Boolean>> fold(@Valid @RequestBody FoldRequest request) {
        // Validate that the request body is not null.
        if (request == null) {
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(), "No request body provided");
        }

        // Process the fold request using the geometry service.
        return geometryService.fold(request);
    }

    /**
     * Handles annotation requests for an origami structure.
     *
     * - Validates the request to ensure it contains necessary data.
     * - Checks that the origami ID, step ID, and faces list are not null or empty.
     * - Delegates annotation processing to `GeometryService.annotate()`.
     *
     * @param request The annotation request containing face modifications.
     * @return ResponseEntity with a BaseResponse indicating success or failure.
     * @throws IllegalArgumentException If the request contains missing or invalid data.
     */
    @PostMapping("/annotate")
    public BaseResponse<Boolean> annotate(@Valid @RequestBody AnnotationRequest request) {
        // TODO: More checks needed
        // Validate that the request body is not null.
        if (request == null) {
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(), "No request body provided");
        }

        // Validate that the origami ID is provided.
        if (request.getOrigamiId() == null) {
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(),
                    "Field 'origamiId' in Annotate must not be null");
        }

        // Validate that the step ID in origami is provided.
        if (request.getStepIdInOrigami() == null) {
            return BaseResponse.failure(HttpStatus.BAD_REQUEST.value(),
                    "Field 'stepIdInOrigami' in Annotate must not be null");
        }

        // Retrieve the list of face annotation requests.
        List<FaceAnnotateRequest> faces = request.getFaces();

        // Validate that the faces list is not null.
        if (faces == null) {
            String errorMessage = "faces list is null," +
                    " verify if request is valid (null faces list)";
            throw new IllegalArgumentException(errorMessage);
        }

        // Validate that the faces list is not empty.
        if (faces.isEmpty()) {
            String errorMessage = "faces list is empty," +
                    " verify if request is valid (empty faces list)";
            throw new IllegalArgumentException(errorMessage);
        }

        // Process the annotation request using the geometry service.
        return  geometryService.annotate(request);
    }

    /**
     * Retrieves a specific step in the origami folding process.
     *
     * - Expects a long value representing the step ID.
     * - Currently returns a success response without implementation.
     *
     * @param request The ID of the step to retrieve.
     * @return ResponseEntity with a BaseResponse indicating success.
     */
    @GetMapping("/get/step")
    public ResponseEntity<BaseResponse<Boolean>> getStep(@RequestBody long request) {
        // TODO: Implement logic to retrieve and return the requested step.

        return BaseResponse.success();
    }

}
