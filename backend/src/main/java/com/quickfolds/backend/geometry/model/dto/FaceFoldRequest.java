package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class FaceFoldRequest {

    @NotNull(message = "Field 'idInOrigami' in Face Fold must not be null")
    @Positive(message = "Field 'idInOrigami' in Face Fold must be positive")
    private Integer idInOrigami;

    @Valid
    @NotNull(message = "Field 'vertices' in Face Fold must not be null")
    @Size(min = 1, message = "vertices list in Face Fold cannot be empty")
    private List<VertexRequest> vertices;

    @Valid
    private List<EdgeRequest> edges;

    @Valid
    private Annotation annotations;
}
