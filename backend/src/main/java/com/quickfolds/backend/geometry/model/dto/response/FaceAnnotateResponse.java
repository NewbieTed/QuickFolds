package com.quickfolds.backend.geometry.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing the response for annotating a specific face in an origami model.
 * <p>
 * This class is used to return detailed information about annotation modifications for a specific face in API responses.
 * It encapsulates data such as the face's identifier in the origami model and IDs of deleted points and lines,
 * as well as wraping a list of {@link PointAnnotationResponse} objects and {@link LineAnnotationResponse} objects.
 * <p>
 * Typical use cases include retrieving details of annotations to a specific face.
 *
 * Dependencies:
 * <ul>
 *     <li>{@link PointAnnotationResponse}: Represents individual annotated points.</li>
 *     <li>{@link LineAnnotationResponse}: Represents individual annotated lines.</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceAnnotateResponse {

    /**
     * The unique identifier of the face within the origami model.
     * <p>
     * This ID serves to identify the face within a specific origami model.
     */
    private Integer idInOrigami;

    /**
     * A list of annotated points included in the response.
     * <p>
     * Each annotated point is represented as a {@link PointAnnotationResponse} object,
     * providing detailed information about the point.
     * <p>
     * This list can be empty if no points were annotated on the face.
     */
    private List<PointAnnotationResponse> points;

    /**
     * A list of annotated lines included in the response.
     * <p>
     * Each annotated line is represented as a {@link LineAnnotationResponse} object,
     * providing detailed information about the line.
     * <p>
     * This list can be empty if no lines were annotated on the face.
     */
    private List<LineAnnotationResponse> lines;

    /**
     * List of point IDs to be deleted from the origami face.
     * <p>
     * This list can be empty if no points were deleted.
     */
    private List<Integer> deletedPoints;

    /**
     * List of line IDs to be deleted from the origami face.
     * <p>
     * This list can be empty if no lines were deleted.
     */
    private List<Integer> deletedLines;
}