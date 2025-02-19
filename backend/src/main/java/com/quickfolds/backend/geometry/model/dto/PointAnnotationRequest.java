package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a request to annotate a point in an origami face.
 *
 * - Contains coordinates and optional edge association for the annotated point.
 * - Ensures validation constraints for data integrity.
 *
 * Validation:
 * - `idInFace`: Must not be null and must be non-negative.
 * - `x`, `y`: Must not be null (represents the coordinates of the point).
 * - `onEdgeIdInFace`: Must be non-negative (if provided).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointAnnotationRequest {
    /**
     * The unique identifier of the annotated point within the face.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInFace' in Point Annotation must not be null")
    @PositiveOrZero(message = "Field 'idInFace' in Point Annotation must be non-negative")
    private Integer idInFace;

    /**
     * The x-coordinate of the annotated point.
     *
     * - Must be non-null.
     */
    @NotNull(message = "Field 'x' in Point Annotation must not be null")
    private Double x;

    /**
     * The y-coordinate of the annotated point.
     *
     * - Must be non-null.
     */
    @NotNull(message = "Field 'y' in Point Annotation must not be null")
    private Double y;

    /**
     * The ID of the edge within the face on which this point is located.
     *
     * - Must be zero or positive if provided.
     * - Can be null if the point is not on an edge.
     */
    @PositiveOrZero(message = "Field 'onEdgeIdInFace' in Point Annotation must be non-negative")
    private Integer onEdgeIdInFace;
}