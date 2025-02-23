package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing an edge in an origami face.
 * <p>
 * - Defines an edge with its position within a face and its angle.
 * - Ensures validation constraints to maintain data integrity.
 * <p>
 * Validation:
 * - `idInFace`: Must not be null and must be non-negative.
 * - `faceIdInOrigami`: Must not be null and must be non-negative.
 * - `angle`: Must not be null.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoldEdgeRequest {

    /**
     * The unique identifier of the other edge within the face.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInFace2' in Edge must not be null")
    @PositiveOrZero(message = "Field 'idInFace2' in Edge must be non-negative")
    private Integer idInOtherFace;

    /**
     * The ID of the other face in the origami model where this edge is located.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'face2IdInOrigami' in Edge must not be null")
    @PositiveOrZero(message = "Field 'face2IdInOrigami' in Edge must be non-negative")
    private Integer otherFaceIdInOrigami;

    /**
     * The angle of the edge relative to its face.
     * <p>
     * - Must be non-null.
     * - No explicit validation on angle values (consider adding range validation if needed).
     */
    @NotNull(message = "Field 'angle' in Edge must not be null")
    private Integer angle;
}
