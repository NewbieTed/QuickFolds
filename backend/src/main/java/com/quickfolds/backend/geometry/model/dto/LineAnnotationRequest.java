package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineAnnotationRequest {
    @NotNull(message = "Field 'idInFace' in Line Annotation must not be null")
    @Positive(message = "Field 'idInFace' in Line Annotation must be positive")
    private Integer idInFace;

    @NotNull(message = "Field 'pointIdInOrigami1' in Line Annotation must not be null")
    @Positive(message = "Field 'pointIdInOrigami1' in Line Annotation must be positive")
    private Integer point1IdInOrigami;

    @NotNull(message = "Field 'pointIdInOrigami2' in Line Annotation must not be null")
    @Positive(message = "Field 'pointIdInOrigami2' in Line Annotation must be positive")
    private Integer point2IdInOrigami;
}
