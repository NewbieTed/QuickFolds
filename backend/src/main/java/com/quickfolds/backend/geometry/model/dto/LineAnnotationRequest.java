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
public class LineAnnotationRequest {
    @NotNull(message = "Field 'idInFace' in Line Annotation must not be null")
    @PositiveOrZero(message = "Field 'idInFace' in Line Annotation must be non-negative")
    private Integer idInFace;

    @NotNull(message = "Field 'pointIdInOrigami1' in Line Annotation must not be null")
    @PositiveOrZero(message = "Field 'pointIdInOrigami1' in Line Annotation must be positive")
    private Integer point1IdInOrigami;

    @NotNull(message = "Field 'pointIdInOrigami2' in Line Annotation must not be null")
    @PositiveOrZero(message = "Field 'pointIdInOrigami2' in Line Annotation must be non-negative")
    private Integer point2IdInOrigami;
}
