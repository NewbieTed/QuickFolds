package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AnnotationRequest {

    @NotNull(message = "Field 'origamiId' in Annotate must not be null")
    @Positive(message = "Field 'origamiId' in Annotate must be positive")
    private Long origamiId;

    @NotNull(message = "Field 'stepIdInOrigami' in Annotate must not be null")
    @Positive(message = "Field 'stepIdInOrigami' in Annotate must be positive")
    private Integer stepIdInOrigami;

    @Valid
    private List<FaceAnnotateRequest> faces;
}
