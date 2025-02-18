package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VertexRequest {
    @NotNull(message = "Field 'idInFace' in Vertex must not be null")
    @PositiveOrZero(message = "Field 'idInFace' in Vertex must be non-negative")
    private Integer idInFace;

    @NotNull(message = "Field 'xPos' in Vertex must not be null")
    private Double x;

    @NotNull(message = "Field 'yPos' in Vertex must not be null")
    private Double y;
}