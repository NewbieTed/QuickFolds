package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnotationRequest {

    @NotNull(message = "Field 'origamiId' in Annotate Request must not be null")
    @Positive(message = "Field 'origamiId' in Annotate Request must be positive")
    private Long origamiId;

    @NotNull(message = "Field 'stepIdInOrigami' in Annotate Request must not be null")
    @Positive(message = "Field 'stepIdInOrigami' in Annotate Request must be positive")
    private Integer stepIdInOrigami;

    @Valid
    private List<FaceAnnotateRequest> faces;
}
