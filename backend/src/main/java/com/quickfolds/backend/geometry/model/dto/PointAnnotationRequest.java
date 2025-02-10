package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PointAnnotationRequest {

    @NotNull(message = "Field 'idInFace' in Point Annotation must not be null")
    @Positive(message = "Field 'idInFace' in Point Annotation must be positive")
    private Integer idInFace;

    @NotNull(message = "Field 'x' in Point Annotation must not be null")
    private Double x;

    @NotNull(message = "Field 'y' in Point Annotation must not be null")
    private Double y;

    @Positive(message = "Field 'onEdgeId' in Point Annotation must be positive")
    private Integer onEdgeIdInFace; // Edge this point lies on, or null if it doesn't lie on any edge
}