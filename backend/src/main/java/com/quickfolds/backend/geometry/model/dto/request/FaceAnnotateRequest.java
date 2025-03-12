package com.quickfolds.backend.geometry.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing an annotation request for a specific face in an origami model.
 * <p>
 * This class is used to submit annotation modifications for a specific face,
 * ensuring the provided data meets integrity constraints before processing.
 * <p>
 * Validation:
 * - `idInOrigami`: Must not be null and must be non-negative.
 * - `annotations`: Represents annotation details and is validated separately.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceAnnotateRequest {

    /**
     * The unique identifier of the face within the origami model.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInOrigami' in FaceAnnotateRequest must not be null")
    @PositiveOrZero(message = "Field 'idInOrigami' in FaceAnnotateRequest must be non-negative")
    private Integer idInOrigami;

    /**
     * The annotations applied to this face.
     * <p>
     * - Contains details about added or deleted annotation elements.
     * - Validated using `@Valid` to ensure nested constraints are enforced.
     * - Can be null if no annotations are provided.
     */
    @Valid
    private AnnotateRequest annotations;
}