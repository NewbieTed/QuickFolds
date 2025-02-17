package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointAnnotationRequest {

    @NotNull(message = "Field 'idInFace' in Point Annotation must not be null")
    @PositiveOrZero(message = "Field 'idInFace' in Point Annotation must be non-negative")
    private Integer idInFace;

    @NotNull(message = "Field 'x' in Point Annotation must not be null")
    private Double x;

    @NotNull(message = "Field 'y' in Point Annotation must not be null")
    private Double y;

    @PositiveOrZero(message = "Field 'onEdgeIdInFace' in Point Annotation must be non-negative")
    private Integer onEdgeIdInFace;
}