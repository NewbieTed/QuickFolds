package com.quickfolds.backend.geometry.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class AnnotateRequest {
    private List<PointAnnotation> points;
    private List<LineAnnotation> lines;
}