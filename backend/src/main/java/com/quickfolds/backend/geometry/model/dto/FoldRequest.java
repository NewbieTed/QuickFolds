package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing a request to perform a fold operation on an origami model.
 *
 * - Specifies which faces should be added and which should be removed during the fold.
 * - Ensures validation constraints to maintain data integrity.
 *
 * Validation:
 * - `origamiId`: Must not be null and must be non-negative.
 * - `stepIdInOrigami`: Must not be null and must be non-negative.
 * - `anchoredIdInOrigami`: Must not be null and must be non-negative.
 * - `faces`: Must not be null and must contain at least one face.
 * - `deletedFaces`: Must not be null and must contain at least one face ID to be deleted.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoldRequest {
    /**
     * The ID of the origami model where the fold is applied.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'origamiId' in Fold must not be null")
    @PositiveOrZero(message = "Field 'origamiId' in Fold must be non-negative")
    private Long origamiId;

    /**
     * The step identifier within the origami model where the fold is applied.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'stepIdInOrigami' in Fold must not be null")
    @PositiveOrZero(message = "Field 'stepIdInOrigami' in Fold must be non-negative")
    private Integer stepIdInOrigami;

    /**
     * The ID of the anchor point in the origami model that serves as the pivot for folding.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'anchoredIdInOrigami' in Fold must not be null")
    @PositiveOrZero(message = "Field 'anchoredIdInOrigami' in Fold must be non-negative")
    private Integer anchoredIdInOrigami;

    /**
     * List of new faces to be added as part of the fold operation.
     *
     * - Must not be null.
     * - Must contain at least one face.
     * - Each face is validated using `FaceFoldRequest`.
     */
    @Valid
    @NotNull(message = "Field 'faces' in Fold must not be null")
    @Size(min = 1, message = "Faces list in Fold cannot be empty")
    private List<FaceFoldRequest> faces;

    /**
     * List of face IDs that should be deleted as part of the fold operation.
     *
     * - Must not be null.
     * - Must contain at least one entry.
     */
    @NotNull(message = "Field 'deletedFaces' in Fold must not be null")
    @Size(min = 1, message = "Deleted faces list in Fold cannot be empty")
    private List<Integer> deletedFaces;

}
