package com.quickfolds.backend.geometry.model.dto;

import lombok.Data;

@Data
public class PointAnnotation {
    private double x;
    private double y;
    private int onEdge; // Edge this point lies on, or null if it doesn't lie on any edge
}