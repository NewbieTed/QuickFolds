package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing a request to create or modify a folded face in an origami model.
 *
 * - Specifies the new face structure after a fold operation.
 * - Ensures validation constraints for data integrity.
 *
 * Validation:
 * - `idInOrigami`: Must not be null and must be non-negative.
 * - `vertices`: Must not be null and must contain at least one vertex.
 * - `edges`: Can be null, but if present, must be validated.
 * - `annotations`: Represents annotations applied to this face.
 */
@Data
public class FaceFoldRequest {
    /**
     * The unique identifier of the face within the origami model.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInOrigami' in Face Fold must not be null")
    @Positive(message = "Field 'idInOrigami' in Face Fold must be positive")
    private Integer idInOrigami;

    /**
     * List of vertices defining the new folded face.
     *
     * - Must not be null.
     * - Must contain at least one vertex.
     * - Each vertex is validated using `VertexRequest`.
     */
    @Valid
    @NotNull(message = "Field 'vertices' in Face Fold must not be null")
    @Size(min = 1, message = "vertices list in Face Fold cannot be empty")
    private List<VertexRequest> vertices;

    /**
     * List of edges defining the new folded face.
     *
     * - Can be null.
     * - If provided, each edge is validated using `EdgeRequest`.
     */
    @Valid
    private List<EdgeRequest> edges;

    /**
     * Annotations applied to this folded face.
     *
     * - Can be null.
     * - If provided, the annotation object is validated using `@Valid`.
     */
    @Valid
    private Annotation annotations;
}
