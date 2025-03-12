package com.quickfolds.backend.geometry.model.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a fold edge in an origami face.
 * <p>
 * This class defines the connection between two faces along a fold edge,
 * including their relative positions and the fold angle.
 * <p>
 * Validation:
 * - `idInOtherFace`: Must not be null and must be non-negative.
 * - `otherFaceIdInOrigami`: Must not be null and must be non-negative.
 * - `angle`: Must not be null.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoldEdgeRequest {

    /**
     * The unique identifier of the edge within the other face.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInOtherFace' in FoldEdgeRequest must not be null")
    @PositiveOrZero(message = "Field 'idInOtherFace' in FoldEdgeRequest must be non-negative")
    private Integer idInOtherFace;

    /**
     * The ID of the other face in the origami model where this edge is located.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'otherFaceIdInOrigami' in FoldEdgeRequest must not be null")
    @PositiveOrZero(message = "Field 'otherFaceIdInOrigami' in FoldEdgeRequest must be non-negative")
    private Integer otherFaceIdInOrigami;

    /**
     * The angle of the fold edge relative to its face.
     * <p>
     * - Must be non-null.
     * - No explicit validation on angle values (consider adding range validation if needed).
     */
    @NotNull(message = "Field 'angle' in FoldEdgeRequest must not be null")
    private Double angle;
}