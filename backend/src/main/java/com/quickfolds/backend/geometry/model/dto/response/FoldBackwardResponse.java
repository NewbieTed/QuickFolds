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
     * The ID of the anchor face in the origami model that serves as the pivot for folding.
     * <p>
     * This ID serves to identify the anchor face within a specific origami model.
     */
    private Integer anchoredFaceIdInOrigami;

    /**
     * Original faces to restore with their complete geometry
     */
    private List<FaceResponse> facesToRestore;

    /**
     * IDs of faces to hide (created during the fold)
     */
    private List<Integer> facesToDelete;

    /**
     * Annotations to remove
     */
    private List<FaceAnnotateResponse> annotations;
}