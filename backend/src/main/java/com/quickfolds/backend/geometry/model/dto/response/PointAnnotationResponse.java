package com.quickfolds.backend.geometry.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing the response for a point annotation.
 * <p>
 * This class is used to return detailed information about a point annotation in API responses.
 * It encapsulates data such as the annotated point's identifier in the face and its coordinates.
 * <p>
 * Typical use cases include retrieving details of a specific annotated point.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointAnnotationResponse {

    /**
     * The face the annotated point is on.
     * <p>
     * This ID serves to identify the face the point is in within the origami model.
     */
    private Integer faceIdInOrigami;

    /**
     * The identifier of the annotated point within the face.
     * <p>
     * This ID serves to identify the annotated point within a specific face.
     */
    private Integer idInFace;

    /**
     * The x-coordinate of the annotated point.
     */
    private Double x;

    /**
     * The y-coordinate of the annotated point.
     */
    private Double y;

    /**
     * The ID of the edge within the face on which this point is located.
     * <p>
     * Indicates which edge the point is on if it's on one.
     */
    private Integer onEdgeIdInFace;
}