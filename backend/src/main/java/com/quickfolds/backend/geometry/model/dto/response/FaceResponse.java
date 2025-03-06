package com.quickfolds.backend.geometry.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing the response for a face in an origami model.
 * <p>
 * This class is used to return detailed information about a face in API responses.
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
public class FaceResponse {

    /**
     * The unique identifier of the face within the origami model.
     * <p>
     * This ID serves to identify the face within a specific origami model.
     */
    private Integer idInOrigami;


}