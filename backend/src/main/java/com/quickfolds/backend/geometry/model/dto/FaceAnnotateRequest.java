package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceAnnotateRequest {

    @NotNull(message = "Field 'idInOrigami' in Face Annotate must not be null")
    @PositiveOrZero(message = "Field 'idInOrigami' in Face Annotate must be non-negative")
    private Integer idInOrigami;

    @Valid
    private Annotation annotations;

}
