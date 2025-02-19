package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/**
 * DTO (Data Transfer Object) representing an annotation request for a specific face in an origami model.
 *
 * - Used to submit annotation modifications on a particular face.
 * - Ensures validation constraints to maintain data integrity.
 *
 * Validation:
 * - `idInOrigami`: Must not be null and must be non-negative.
 * - `annotations`: Represents annotation details and is validated separately.
 */
@Data
public class FaceAnnotateRequest {
    /**
     * The unique identifier of the face within the origami model.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInOrigami' in Face Annotate must not be null")
    @Positive(message = "Field 'idInOrigami' in Face Annotate must be positive")
    private Integer idInOrigami;

    /**
     * The annotations applied to this face.
     *
     * - Contains details about added or deleted annotation elements.
     * - Validated using `@Valid` to ensure nested constraints are enforced.
     */
    @Valid
    private Annotation annotations;

}
