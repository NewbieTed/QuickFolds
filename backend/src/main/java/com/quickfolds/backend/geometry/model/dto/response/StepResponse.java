package com.quickfolds.backend.geometry.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO (Data Transfer Object) representing the response for a step in an origami model.
 * <p>
 * This class is used to return detailed information about a step in API responses.
 * It encapsulates data such as what objects need to be created and deleted in the step.
 * Depending on the step type, this data may be a wrapped list of {@link FaceAnnotateResponse} objects,
 * a {@link FoldForwardResponse} object, or a {@link FoldBackwardResponse} object.
 * <p>
 * Typical use cases include:
 * <ul>
 *     <li>Retrieving details to go forward one step.</li>
 *     <li>Retrieving details to go backward one step.</li>
 * </ul>
 *
 * Dependencies:
 * <ul>
 *     <li>{@link FaceAnnotateResponse}: Represents the annotations to do for a specific face</li>
 *     <li>{@link FoldForwardResponse}: Represents a fold</li>
 *     <li>{@link FoldBackwardResponse}: Represents how to undo a fold</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StepResponse {

    /**
     * Indicates the type of step being sent back
     */
    private String stepType;

    /**
     * Indicates the direction of the step being sent back
     * <p>
     * For frontend verification purposes
     */
    private Boolean isForward;

    /**
     * A list of faces to annotate included in the response.
     * <p>
     * Each face annotation is represented as a {@link FaceAnnotateResponse} object,
     * providing detailed information about the annotations on the face.
     * <p>
     * This list can be empty if the requested step is not an annotate step.
     */
    private List<FaceAnnotateResponse> annotations;

    /**
     * Fold information for fold steps.
     * Contains details about faces, edges, and vertices in a fold operation.
     * Populated only for fold steps.
     */
    private FoldForwardResponse foldForward;

    /**
     * Backward fold information
     */
    private FoldBackwardResponse foldBackward;
}