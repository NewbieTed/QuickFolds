package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class Annotation {
    @Valid
    private List<PointAnnotationRequest> points;

    @Valid
    private List<LineAnnotationRequest> lines;

    @Valid
    @Positive(message = "All elements in deletedPoints in Annotate must be positive.")
    private List<Integer> deletedPoints;

    @Valid
    @Positive(message = "All elements in deletedLines in Annotate must be positive.")
    private List<Integer> deletedLines;
}