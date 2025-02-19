package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a vertex in an origami face.
 *
 * - Specifies the vertex's position and unique identifier within the face.
 * - Ensures validation constraints to maintain data integrity.
 *
 * Validation:
 * - `idInFace`: Must not be null and must be non-negative.
 * - `x`: Must not be null (represents the x-coordinate of the vertex).
 * - `y`: Must not be null (represents the y-coordinate of the vertex).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VertexRequest {
    /**
     * The unique identifier of the vertex within the face.
     *
     * - Must be non-null.
     * - Must be zero or positive (no negative values allowed).
     */
    @NotNull(message = "Field 'idInFace' in Vertex must not be null")
    @PositiveOrZero(message = "Field 'idInFace' in Vertex must be non-negative")
    private Integer idInFace;

    /**
     * The x-coordinate of the vertex in the origami model.
     *
     * - Must be non-null.
     */
    @NotNull(message = "Field 'xPos' in Vertex must not be null")
    private Double x;

    /**
     * The y-coordinate of the vertex in the origami model.
     *
     * - Must be non-null.
     */
    @NotNull(message = "Field 'yPos' in Vertex must not be null")
    private Double y;
}