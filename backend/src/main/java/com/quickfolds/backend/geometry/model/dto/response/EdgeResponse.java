package com.quickfolds.backend.geometry.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EdgeResponse {
    private Integer idInFace;
    private String edgeType; // "side" or "fold"

    // For side edges
    private Integer vertex1IdInFace;
    private Integer vertex2IdInFace;

    // For fold edges
    private Integer otherFaceIdInOrigami;
    private Integer idInOtherFace;
    private Double angle;
}