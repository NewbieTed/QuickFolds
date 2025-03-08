package com.quickfolds.backend.geometry.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoldBackwardResponse {
    /**
     * Original faces to restore with their complete geometry
     */
    private List<FaceResponse> facesToRestore;

    /**
     * IDs of faces to hide (created during the fold)
     */
    private List<Integer> facesToDelete;
}