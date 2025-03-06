package com.quickfolds.backend.geometry.model.dto.request;

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
 * This class defines the structure of a new face after a fold operation,
 * including its vertices, edges, and any associated annotations.
 * <p>
 * Validation:
 * - `idInOrigami`: Must not be null and must be non-negative.
 * - `vertices`: Must not be null and must contain at least three vertices.
 * - `edges`: Can be null, but if provided, each must pass validation.
 * - `annotations`: Can be null, validated if provided.
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
    @NotNull(message = "Field 'idInOrigami' in FaceFoldRequest must not be null")
    @PositiveOrZero(message = "Field 'idInOrigami' in FaceFoldRequest must be non-negative")
    private Integer idInOrigami;

    /**
     * List of vertices defining the structure of the folded face.
     * <p>
     * - Must not be null.
     * - Must contain at least three vertices.
     * - Each vertex must be non-null and validated using `VertexRequest`.
     */
    @Valid
    @NotNull(message = "Field 'vertices' in FaceFoldRequest must not be null")
    @Size(min = 3, message = "Field 'vertices' in FaceFoldRequest must contain at least 3 items")
    private List<@Valid @NotNull VertexRequest> vertices;

    /**
     * List of edges associated with the folded face.
     * <p>
     * - Can be null if no edges are defined.
     * - If provided, each edge is validated using `FoldEdgeRequest`.
     */
    @Valid
    private List<@Valid FoldEdgeRequest> edges;

    /**
     * Annotations applied to the folded face.
     * <p>
     * - Can be null if no annotations are provided.
     * - If provided, the annotation object is validated using `@Valid`.
     */
    @Valid
    private AnnotateRequest annotations;
}