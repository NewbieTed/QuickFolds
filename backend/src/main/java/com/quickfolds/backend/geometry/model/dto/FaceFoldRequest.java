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
 * DTO (Data Transfer Object) representing a request to create or modify a folded face in an origami model.
 * <p>
 * - Specifies the new face structure after a fold operation.
 * - Ensures validation constraints for data integrity.
 * <p>
 * Validation:
 * - `idInOrigami`: Must not be null and must be positive.
 * - `vertices`: Must not be null and must contain at least one vertex.
 * - `edges`: Can be null, but if present, must be validated.
 * - `annotations`: Represents annotations applied to this face.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceFoldRequest {
    /**
     * The unique identifier of the face within the origami model.
     * <p>
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInOrigami' in Face Fold must not be null")
    @PositiveOrZero(message = "Field 'idInOrigami' in Face Fold must be non-negative")
    private Integer idInOrigami;

    /**
     * List of vertices defining the new folded face.
     * <p>
     * - Must not be null.
     * - Must contain at least one vertex.
     * - Each vertex is validated using `VertexRequest`.
     */
    @Valid
    @NotNull(message = "Field 'vertices' in Face Fold must not be null")
    @Size(min = 3, message = "vertices list in Face Fold cannot have less than 3 items")
    private List<@Valid VertexRequest> vertices;

    /**
     * List of edges defining the new folded face.
     * <p>
     * - Can be null.
     * - If provided, each edge is validated using `FoldEdgeRequest`.
     */
    @Valid
    private List<@Valid FoldEdgeRequest> edges;

    /**
     * Annotations applied to this folded face.
     * <p>
     * - Can be null.
     * - If provided, the annotation object is validated using `@Valid`.
     */
    @Valid
    private Annotation annotations;
}
