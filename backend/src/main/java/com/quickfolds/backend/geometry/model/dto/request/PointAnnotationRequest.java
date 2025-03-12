package com.quickfolds.backend.geometry.model.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a request to annotate a point in an origami face.
 * <p>
 * This class defines the structure for annotating a point within an origami face,
 * including its coordinates and optional edge association.
 * <p>
 * Validation:
 * - `idInFace`: Must not be null and must be non-negative.
 * - `x`, `y`: Must not be null (represents the coordinates of the point).
 * - `onEdgeIdInFace`: Must be non-negative if provided.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointAnnotationRequest {

    /**
     * The unique identifier of the annotated point within the face.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInFace' in PointAnnotationRequest must not be null")
    @PositiveOrZero(message = "Field 'idInFace' in PointAnnotationRequest must be non-negative")
    private Integer idInFace;

    /**
     * The x-coordinate of the annotated point.
     * <p>
     * - Must be non-null.
     * - Represents the horizontal position within the face.
     */
    @NotNull(message = "Field 'x' in PointAnnotationRequest must not be null")
    private Double x;

    /**
     * The y-coordinate of the annotated point.
     * <p>
     * - Must be non-null.
     * - Represents the vertical position within the face.
     */
    @NotNull(message = "Field 'y' in PointAnnotationRequest must not be null")
    private Double y;

    /**
     * The ID of the edge within the face on which this point is located.
     * <p>
     * - Must be zero or positive if provided.
     * - Can be null if the point is not associated with any edge.
     */
    @PositiveOrZero(message = "Field 'onEdgeIdInFace' in PointAnnotationRequest must be non-negative")
    private Integer onEdgeIdInFace;
}