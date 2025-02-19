package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing annotations applied to an origami face.
 *
 * - Contains lists of added and deleted points and lines.
 * - Ensures validation constraints for maintaining data integrity.
 *
 * Validation:
 * - `points` and `lines`: Lists of annotation requests, validated separately.
 * - `deletedPoints` and `deletedLines`: Lists of non-negative integers representing deleted elements.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Annotation {
    /**
     * List of points to be added as annotations.
     *
     * - Each point is validated separately using `PointAnnotationRequest`.
     */
    @Valid
    private List<PointAnnotationRequest> points;

    /**
     * List of lines to be added as annotations.
     *
     * - Each line is validated separately using `LineAnnotationRequest`.
     */
    @Valid
    private List<LineAnnotationRequest> lines;

    /**
     * List of point IDs that should be deleted.
     *
     * - All values must be non-negative.
     * - Ensures no negative indices are referenced.
     */
    @Valid
    private List<@PositiveOrZero(message = "All elements in deletedPoints in Annotate must be non-negative.") Integer> deletedPoints;

    /**
     * List of line IDs that should be deleted.
     *
     * - All values must be non-negative.
     * - Prevents invalid deletions by enforcing positive indices.
     */
    @Valid
    private List<@PositiveOrZero(message = "All elements in deletedLines in Annotate must be non-negative.") Integer> deletedLines;
}