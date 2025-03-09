package com.quickfolds.backend.geometry.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal DTO for mapping face details in MyBatis queries
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceWithDetailsDTO {
    private Long faceId;
    private Integer idInOrigami;
}