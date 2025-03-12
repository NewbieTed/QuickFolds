package com.quickfolds.backend.geometry.model.dto.request;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a request to perform a rotate operation of a face on an origami model.
 * <p>
 * This class defines the input parameters required for a rotate operation
 * <p>
 * Validation:
 * - `anchoredFaceIdInOrigami`: Must not be null and must be non-negative.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceRotateRequest {
    /**
     * The ID of the anchor face in the origami model that serves as the pivot for rotating.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'anchoredFaceIdInOrigami' in FaceRotateRequest must not be null")
    @PositiveOrZero(message = "Field 'anchoredFaceIdInOrigami' in FaceRotateRequest must be non-negative")
    private Integer anchoredFaceIdInOrigami;


    /**
     * The ID of the rotate face in the origami model.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'rotatedFaceIdInOrigami' in FaceRotateRequest must not be null")
    @PositiveOrZero(message = "Field 'rotatedFaceIdInOrigami' in FaceRotateRequest must be non-negative")
    private Integer rotatedFaceIdInOrigami;


    /**
     * The angle of the fold edge relative to its face.
     * <p>
     * - Must be non-null.
     * - No explicit validation on angle values (consider adding range validation if needed).
     */
    @NotNull(message = "Field 'angle' in FaceRotateRequest must not be null")
    private Double angle;
}
