package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class FaceAnnotateRequest {

    @NotNull(message = "Field 'idInOrigami' in Face Annotate must not be null")
    @Positive(message = "Field 'idInOrigami' in Face Annotate must be positive")
    private Integer idInOrigami;

    @Valid
    private Annotation annotations;

}
