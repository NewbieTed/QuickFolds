package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EdgeRequest {
    @NotNull(message = "Field 'idInFace' in Edge must not be null")
    @Positive(message = "Field 'idInFace' in Edge must be positive")
    private Integer idInFace;

    @NotNull(message = "Field 'faceIdInOrigami' in Edge must not be null")
    @Positive(message = "Field 'faceIdInOrigami' in Edge must be positive")
    private Integer faceIdInOrigami;

    @NotNull(message = "Field 'angle' in Edge must not be null")
    private Integer angle;
}
