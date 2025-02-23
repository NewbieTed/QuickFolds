package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing a vertex in an origami face.
 * <p>
 * - Specifies the vertex's position and unique identifier within the face.
 * - Ensures validation constraints to maintain data integrity.
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
     */
    @NotNull(message = "Field 'xPos' in Vertex must not be null")
    private Double x;

    /**
     * The y-coordinate of the vertex in the origami model.
     * <p>
     * - Must be non-null.
     */
    @NotNull(message = "Field 'yPos' in Vertex must not be null")
    private Double y;
}