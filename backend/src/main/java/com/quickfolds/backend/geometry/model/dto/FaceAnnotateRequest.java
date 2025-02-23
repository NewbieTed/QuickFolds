package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing an annotation request for a specific face in an origami model.
 * <p>
 * - Used to submit annotation modifications on a particular face.
 * - Ensures validation constraints to maintain data integrity.
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
    @NotNull(message = "Field 'idInOrigami' in Face Annotate must not be null")
    @PositiveOrZero(message = "Field 'idInOrigami' in Face Annotate must be non-negative")
    private Integer idInOrigami;

    /**
     * The annotations applied to this face.
     * <p>
     * - Contains details about added or deleted annotation elements.
     * - Validated using `@Valid` to ensure nested constraints are enforced.
     */
    @Valid
    private Annotation annotations;

}
