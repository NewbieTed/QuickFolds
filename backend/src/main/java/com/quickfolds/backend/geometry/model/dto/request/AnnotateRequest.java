package com.quickfolds.backend.geometry.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing annotations applied to an origami face.
 * <p>
 * This class contains lists of added and deleted points and lines, ensuring proper
 * validation constraints for maintaining data integrity during annotation operations.
 * <p>
 * Validation:
 * - `points` and `lines`: Lists of annotation requests, validated individually.
 * - `deletedPoints` and `deletedLines`: Lists of non-negative integers representing IDs of deleted elements.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnotateRequest {

    /**
     * List of points to be added as annotations.
     * <p>
     * - Each point is validated separately using `PointAnnotationRequest`.
     * - Cannot be null; empty list indicates no points to add.
     */
    @Valid
    private List<@Valid @NotNull PointAnnotationRequest> points;

    /**
     * List of lines to be added as annotations.
     * <p>
     * - Each line is validated separately using `LineAnnotationRequest`.
     * - Cannot be null; empty list indicates no lines to add.
     */
    @Valid
    private List<@Valid @NotNull LineAnnotationRequest> lines;

    /**
     * List of point IDs to be deleted from the origami face.
     * <p>
     * - All values must be non-negative.
     * - Ensures no invalid indices are referenced for deletion.
     * - Null indicates no deletions; empty list deletes nothing.
     */
    @Valid
    private List<@NotNull @PositiveOrZero(message = "All elements in deletedPoints must be non-negative.") Integer> deletedPoints;

    /**
     * List of line IDs to be deleted from the origami face.
     * <p>
     * - All values must be non-negative.
     * - Ensures only valid line IDs are referenced for deletion.
     * - Null indicates no deletions; empty list deletes nothing.
     */
    @Valid
    private List<@NotNull @PositiveOrZero(message = "All elements in deletedLines must be non-negative.") Integer> deletedLines;
}