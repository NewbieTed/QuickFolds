package com.quickfolds.backend.geometry.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Annotation {
    @Valid
    private List<PointAnnotationRequest> points;

    @Valid
    private List<LineAnnotationRequest> lines;

    @Valid
    private List<@Positive(message = "All elements in deletedPoints in Annotate must be positive.") Integer> deletedPoints;

    @Valid
    private List<@Positive(message = "All elements in deletedLines in Annotate must be positive.") Integer> deletedLines;
}