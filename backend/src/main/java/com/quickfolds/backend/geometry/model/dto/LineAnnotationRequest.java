package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a request to annotate a line in an origami face.
 * <p>
 * This class defines the structure for annotating a line within an origami face,
 * including the line's unique identifier and the two points that define its endpoints.
 * <p>
 * Validation:
 * - `idInFace`: Must not be null and must be non-negative.
 * - `point1IdInOrigami`: Must not be null and must be non-negative.
 * - `point2IdInOrigami`: Must not be null and must be non-negative.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineAnnotationRequest {

    /**
     * The unique identifier of the annotated line within the face.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInFace' in LineAnnotationRequest must not be null")
    @PositiveOrZero(message = "Field 'idInFace' in LineAnnotationRequest must be non-negative")
    private Integer idInFace;

    /**
     * The ID of the first point in the origami model that defines the line.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'point1IdInOrigami' in LineAnnotationRequest must not be null")
    @PositiveOrZero(message = "Field 'point1IdInOrigami' in LineAnnotationRequest must be non-negative")
    private Integer point1IdInOrigami;

    /**
     * The ID of the second point in the origami model that defines the line.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'point2IdInOrigami' in LineAnnotationRequest must not be null")
    @PositiveOrZero(message = "Field 'point2IdInOrigami' in LineAnnotationRequest must be non-negative")
    private Integer point2IdInOrigami;
}