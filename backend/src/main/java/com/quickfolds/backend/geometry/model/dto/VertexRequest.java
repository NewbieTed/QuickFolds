package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class VertexRequest {
    @NotNull(message = "Field 'idInFace' in Vertex must not be null")
    @Positive(message = "Field 'idInFace' in Vertex must be positive")
    private Integer idInFace;

    @NotNull(message = "Field 'xPos' in Vertex must not be null")
    private Double x;

    @NotNull(message = "Field 'yPos' in Vertex must not be null")
    private Double y;
}