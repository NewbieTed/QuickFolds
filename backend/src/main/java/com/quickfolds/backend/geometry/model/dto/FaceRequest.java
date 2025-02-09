package com.quickfolds.backend.geometry.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class FaceRequest {


    private List<VertexRequest> vertices;
    private List<EdgeRequest> edges;
    private AnnotateRequest annotations;
}
