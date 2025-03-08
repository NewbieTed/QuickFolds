package com.quickfolds.backend.geometry.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing the response for performing a fold operation on an origami model.
 * <p>
 * This class is used to return detailed information about a fold step in API responses.
 * It encapsulates data such as the ID of the anchor face, IDs of deleted faces,
 * as well as wraping a list of {@link FaceResponse} objects.
 * <p>
 * Typical use cases include retrieving details of a specific fold step to reproduce.
 *
 * Dependencies:
 *{@link FaceResponse}: Represents individual faces.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoldForwardResponse {

    /**
     * The ID of the anchor face in the origami model that serves as the pivot for folding.
     * <p>
     * This ID serves to identify the anchor face within a specific origami model.
     */
    private Integer anchoredFaceIdInOrigami;

    /**
     * List of new faces to be added as part of the fold operation.
     * <p>
     * Each face is represented as a {@link FaceResponse} object,
     * providing detailed information about the face.
     */
    private List<FaceResponse> faces;

    /**
     * List of face IDs that should be deleted as part of the fold operation.
     * <p>
     * This list can be empty if no faces were deleted.
     */
    private List<Integer> deletedFaces;

    /**
     * List of face IDs that should be hidden as part of the fold operation.
     * <p>
     * This list can be empty if no faces were hidden.
     */
    private List<FaceAnnotateResponse> annotations;
}