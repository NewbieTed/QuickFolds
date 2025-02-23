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
 * <p>
 * - Specifies which faces should be added and which should be removed during the fold.
 * - Ensures validation constraints to maintain data integrity.
 * <p>
 * Validation:
 * - `origamiId`: Must not be null and must be positive.
 * - `stepIdInOrigami`: Must not be null and must be positive.
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
     * <p>
     * - Must be non-null.
     * - Must be positive.
     */
    @NotNull(message = "Field 'origamiId' in Fold must not be null")
    @Positive(message = "Field 'origamiId' in Fold must be positive")
    private Long origamiId;

    /**
     * The step identifier within the origami model where the fold is applied.
     * <p>
     * - Must be non-null.
     * - Must be positive.
     */
    @NotNull(message = "Field 'stepIdInOrigami' in Fold must not be null")
    @Positive(message = "Field 'stepIdInOrigami' in Fold must be non-negative")
    private Integer stepIdInOrigami;

    /**
     * The ID of the anchor point in the origami model that serves as the pivot for folding.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'anchoredFaceIdInOrigami' in Fold must not be null")
    @PositiveOrZero(message = "Field 'anchoredFaceIdInOrigami' in Fold must be non-negative")
    private Integer anchoredFaceIdInOrigami;

    /**
     * List of new faces to be added as part of the fold operation.
     * <p>
     * - Must not be null.
     * - Must contain at least one face.
     * - Each face is validated using `FaceFoldRequest`.
     */
    @Valid
    @NotNull(message = "Field 'faces' in Fold must not be null")
    @Size(min = 1, message = "Faces list in Fold cannot be empty")
    private List<@Valid FaceFoldRequest> faces;

    /**
     * List of face IDs that should be deleted as part of the fold operation.
     * <p>
     * - Each ID must be zero or positive (no negative values allowed).
     */
    private List<@PositiveOrZero(message = "Items in 'deletedFaces' in Fold must be non-negative") Integer> deletedFaces;

}
