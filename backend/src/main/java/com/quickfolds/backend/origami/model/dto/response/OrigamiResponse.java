package com.quickfolds.backend.origami.model.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrigamiResponse {
    private Long origamiId;
    private String origamiName;
    private String author;
    private Double ratings;
}
