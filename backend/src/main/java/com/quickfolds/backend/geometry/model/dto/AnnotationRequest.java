package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing an annotation request for an origami structure.
 * <p>
 * This class is used to submit annotation modifications to an origami model, ensuring
 * that the provided data meets integrity constraints before processing.
 * <p>
 * Validation:
 * - `origamiId`: Must not be null and must be non-negative.
 * - `stepIdInOrigami`: Must not be null and must be non-negative.
 * - `faces`: Must not be null and must contain at least one valid entry.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnotationRequest {

    /**
     * The ID of the origami model being annotated.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative IDs allowed).
     */
    @NotNull(message = "Field 'origamiId' in AnnotationRequest must not be null")
    @PositiveOrZero(message = "Field 'origamiId' in AnnotationRequest must be non-negative")
    private Long origamiId;

    /**
     * The step identifier within the origami model where the annotation is applied.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values).
     */
    @NotNull(message = "Field 'stepIdInOrigami' in AnnotationRequest must not be null")
    @PositiveOrZero(message = "Field 'stepIdInOrigami' in AnnotationRequest must be non-negative")
    private Integer stepIdInOrigami;

    /**
     * A list of faces within the origami model that will be annotated.
     * <p>
     * - Must not be null.
     * - Must contain at least one face (empty lists are not allowed).
     * - Each face must pass its own validation constraints.
     */
    @Valid
    @NotNull(message = "Field 'faces' in AnnotationRequest must not be null")
    @Size(min = 1, message = "Faces list in AnnotationRequest cannot be empty")
    private List<@Valid @NotNull FaceAnnotateRequest> faces;
}