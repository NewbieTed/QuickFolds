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
public class FoldRequest {

    @NotNull(message = "Field 'origamiId' in Fold must not be null")
    @PositiveOrZero(message = "Field 'origamiId' in Fold must be non-negative")
    private Long origamiId;

    @NotNull(message = "Field 'stepIdInOrigami' in Fold must not be null")
    @PositiveOrZero(message = "Field 'stepIdInOrigami' in Fold must be non-negative")
    private Integer stepIdInOrigami;

    @NotNull(message = "Field 'anchoredIdInOrigami' in Fold must not be null")
    @PositiveOrZero(message = "Field 'anchoredIdInOrigami' in Fold must be non-negative")
    private Integer anchoredIdInOrigami;

    @Valid
    @NotNull(message = "Field 'faces' in Fold must not be null")
    @Size(min = 1, message = "Faces list in Fold cannot be empty")
    private List<FaceFoldRequest> faces;

    @NotNull(message = "Field 'deletedFaces' in Fold must not be null")
    @Size(min = 1, message = "Deleted faces list in Fold cannot be empty")
    private List<Integer> deletedFaces;

}
