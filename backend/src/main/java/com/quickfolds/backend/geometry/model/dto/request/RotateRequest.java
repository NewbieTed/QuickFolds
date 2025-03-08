package com.quickfolds.backend.geometry.model.dto.request;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


/**
 * DTO (Data Transfer Object) representing a request to perform a rotate operation on an origami model.
 * <p>
 * This class defines the input parameters required for a rotate operation
 * <p>
 * Validation:
 * - `origamiId`: Must not be null and must be positive.
 * - `stepIdInOrigami`: Must not be null and must be positive.
 * - `anchoredFaceIdInOrigami`: Must not be null and must be non-negative.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RotateRequest {
    /**
     * The ID of the origami model where the rotation is applied.
     * <p>
     * - Must be non-null.
     * - Must be positive.
     */
    @NotNull(message = "Field 'origamiId' in RotateRequest must not be null")
    @Positive(message = "Field 'origamiId' in RotateRequest must be positive")
    private Long origamiId;

    /**
     * The step identifier within the origami model where the fold is applied.
     * <p>
     * - Must be non-null.
     * - Must be positive.
     */
    @NotNull(message = "Field 'stepIdInOrigami' in RotateRequest must not be null")
    @Positive(message = "Field 'stepIdInOrigami' in RotateRequest must be positive")
    private Integer stepIdInOrigami;


    /**
     * List of faces to be rotated as part of the rotate operation.
     * <p>
     * - Must not be null.
     * - Must contain at least one face.
     * - Each face is validated using `FaceRotateRequest`.
     */
    @Valid
    @NotNull(message = "Field 'faces' in RotateRequest must not be null")
    @Size(min = 1, message = "Faces list in RotateRequest cannot be empty")
    private List<@Valid FaceRotateRequest> faces;
}
