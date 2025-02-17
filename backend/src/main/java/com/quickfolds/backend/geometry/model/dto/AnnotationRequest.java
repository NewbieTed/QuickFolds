package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnotationRequest {

    @NotNull(message = "Field 'origamiId' in Annotate Request must not be null")
    @PositiveOrZero(message = "Field 'origamiId' in Annotate Request must be non-negative")
    private Long origamiId;

    @NotNull(message = "Field 'stepIdInOrigami' in Annotate Request must not be null")
    @PositiveOrZero(message = "Field 'stepIdInOrigami' in Annotate Request must be non-negative")
    private Integer stepIdInOrigami;

    @Valid
    @NotNull(message = "Field 'faces' in Annotate Request must not be null")
    @Size(min = 1, message = "Faces list in Annotate Request cannot be empty")
    private List<FaceAnnotateRequest> faces;
}
