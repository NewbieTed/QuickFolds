package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing an edge in an origami face.
 *
 * - Defines an edge with its position within a face and its angle.
 * - Ensures validation constraints to maintain data integrity.
 *
 * Validation:
 * - `idInFace`: Must not be null and must be non-negative.
 * - `faceIdInOrigami`: Must not be null and must be non-negative.
 * - `angle`: Must not be null.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EdgeRequest {
    /**
     * The unique identifier of the edge within the face.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInFace' in Edge must not be null")
    @PositiveOrZero(message = "Field 'idInFace' in Edge must be non-negative")
    private Integer idInFace;

    /**
     * The ID of the face in the origami model where this edge is located.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'faceIdInOrigami' in Edge must not be null")
    @PositiveOrZero(message = "Field 'faceIdInOrigami' in Edge must be non-negative")
    private Integer faceIdInOrigami;

    /**
     * The angle of the edge relative to its face.
     *
     * - Must be non-null.
     * - No explicit validation on angle values (consider adding range validation if needed).
     */
    @NotNull(message = "Field 'angle' in Edge must not be null")
    private Integer angle;
}
