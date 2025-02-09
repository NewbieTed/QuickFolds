package com.quickfolds.backend.geometry.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class FoldRequest {

    private long origamiID;
    private int anchoredIdInOrigami;

    List<FaceRequest> faces;

}
