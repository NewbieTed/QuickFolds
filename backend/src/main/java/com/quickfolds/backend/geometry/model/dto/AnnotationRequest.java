package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


/**
 * DTO (Data Transfer Object) representing an annotation request for an origami structure.
 *
 * - Used to submit annotation modifications to an origami model.
 * - Ensures validation constraints for request integrity.
 * - Contains a list of annotated faces that will be modified.
 *
 * Validation:
 * - `origamiId`: Must not be null and must be non-negative.
 * - `stepIdInOrigami`: Must not be null and must be non-negative.
 * - `faces`: Must not be null and must contain at least one entry.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnotationRequest {
    /**
     * The ID of the origami model being annotated.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative IDs allowed).
     */
    @NotNull(message = "Field 'origamiId' in Annotate Request must not be null")
    @Positive(message = "Field 'origamiId' in Annotate Request must be positive")
    private Long origamiId;

    /**
     * The step identifier within the origami model where the annotation is applied.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values).
     */
    @NotNull(message = "Field 'stepIdInOrigami' in Annotate Request must not be null")
    @Positive(message = "Field 'stepIdInOrigami' in Annotate Request must be positive")
    private Integer stepIdInOrigami;

    /**
     * A list of faces within the origami model that will be annotated.
     *
     * - Must not be null.
     * - Must contain at least one face (empty lists are not allowed).
     * - Each face must pass its own validation constraints.
     */
    @Valid
    private List<FaceAnnotateRequest> faces;
}
