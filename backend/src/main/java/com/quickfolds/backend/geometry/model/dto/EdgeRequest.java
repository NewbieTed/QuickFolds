package com.quickfolds.backend.geometry.model.dto;

import lombok.Data;

@Data
public class EdgeRequest {
    private int faceIdInOrigami;
    private int angle;
}
