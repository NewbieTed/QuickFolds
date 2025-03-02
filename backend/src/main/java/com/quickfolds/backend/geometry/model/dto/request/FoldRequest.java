package com.quickfolds.backend.geometry.model.dto.request;

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
 * This class defines the input parameters required for a fold operation, including the faces to be added,
 * the faces to be removed, and the anchor face used as the pivot during the fold.
 * <p>
 * Validation:
 * - `origamiId`: Must not be null and must be positive.
 * - `stepIdInOrigami`: Must not be null and must be positive.
 * - `anchoredFaceIdInOrigami`: Must not be null and must be non-negative.
 * - `faces`: Must not be null and must contain at least one valid face.
 * - `deletedFaces`: Must not contain negative values if provided.
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
    @NotNull(message = "Field 'origamiId' in FoldRequest must not be null")
    @Positive(message = "Field 'origamiId' in FoldRequest must be positive")
    private Long origamiId;

    /**
     * The step identifier within the origami model where the fold is applied.
     * <p>
     * - Must be non-null.
     * - Must be positive.
     */
    @NotNull(message = "Field 'stepIdInOrigami' in FoldRequest must not be null")
    @Positive(message = "Field 'stepIdInOrigami' in FoldRequest must be positive")
    private Integer stepIdInOrigami;

    /**
     * The ID of the anchor face in the origami model that serves as the pivot for folding.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'anchoredFaceIdInOrigami' in FoldRequest must not be null")
    @PositiveOrZero(message = "Field 'anchoredFaceIdInOrigami' in FoldRequest must be non-negative")
    private Integer anchoredFaceIdInOrigami;

    /**
     * List of new faces to be added as part of the fold operation.
     * <p>
     * - Must not be null.
     * - Must contain at least one face.
     * - Each face is validated using `FaceFoldRequest`.
     */
    @Valid
    @NotNull(message = "Field 'faces' in FoldRequest must not be null")
    @Size(min = 1, message = "Faces list in FoldRequest cannot be empty")
    private List<@Valid FaceFoldRequest> faces;

    /**
     * List of face IDs that should be deleted as part of the fold operation.
     * <p>
     * - Each ID must be zero or positive (no negative values allowed).
     * - Null indicates no deletions; an empty list deletes nothing.
     */
    private List<@PositiveOrZero(message = "Items in 'deletedFaces' in FoldRequest must be non-negative") Integer> deletedFaces;
}