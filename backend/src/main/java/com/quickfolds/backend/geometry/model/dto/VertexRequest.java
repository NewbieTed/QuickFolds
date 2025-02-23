package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a vertex in an origami face.
 * <p>
 * This class defines the position of a vertex within a specific face of an origami model,
 * ensuring that the provided coordinates meet validation constraints.
 * <p>
 * Validation:
 * - `x`: Must not be null (represents the x-coordinate of the vertex).
 * - `y`: Must not be null (represents the y-coordinate of the vertex).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VertexRequest {

    /**
     * The x-coordinate of the vertex in the origami model.
     * <p>
     * - Must be non-null.
     * - Represents the horizontal position of the vertex within the face.
     */
    @NotNull(message = "Field 'x' in VertexRequest must not be null")
    private Double x;

    /**
     * The y-coordinate of the vertex in the origami model.
     * <p>
     * - Must be non-null.
     * - Represents the vertical position of the vertex within the face.
     */
    @NotNull(message = "Field 'y' in VertexRequest must not be null")
    private Double y;
}