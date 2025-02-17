package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EdgeRequest {
    @NotNull(message = "Field 'idInFace' in Edge must not be null")
    @PositiveOrZero(message = "Field 'idInFace' in Edge must be non-negative")
    private Integer idInFace;

    @NotNull(message = "Field 'faceIdInOrigami' in Edge must not be null")
    @PositiveOrZero(message = "Field 'faceIdInOrigami' in Edge must be non-negative")
    private Integer faceIdInOrigami;

    @NotNull(message = "Field 'angle' in Edge must not be null")
    private Integer angle;
}
