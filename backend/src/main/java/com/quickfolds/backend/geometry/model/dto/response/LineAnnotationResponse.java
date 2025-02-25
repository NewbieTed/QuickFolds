package com.quickfolds.backend.geometry.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) representing the response for a line annotation.
 * <p>
 * This class is used to return detailed information about a line annotation in API responses.
 * It encapsulates data such as the annotated line's identifier in the face and its endpoints.
 * <p>
 * Typical use cases include retrieving details of a specific annotated line.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineAnnotationResponse {

    /**
     * The face the annotated line is on.
     * <p>
     * This ID serves to identify the face the line is in within the origami model.
     */
    private Integer faceIdInOrigami;

    /**
     * The identifier of the annotated line within the face.
     * <p>
     * This ID serves to identify the annotated line within a specific face.
     */
    private Integer idInFace;

    /**
     * The ID of the first point in the origami model that defines the line.
     * <p>
     * Identifies the first endpoint of the annotated line.
     */
    private Integer point1IdInOrigami;

    /**
     * The ID of the second point in the origami model that defines the line.
     * <p>
     * Identifies the second endpoint of the annotated line.
     */
    private Integer point2IdInOrigami;
}