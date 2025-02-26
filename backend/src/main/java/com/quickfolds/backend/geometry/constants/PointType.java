package com.quickfolds.backend.geometry.constants;

/**
 * Defines constant values representing different types of points in an origami model.
 * <p>
 * This class provides string constants for categorizing points based on their role
 * within the origami geometric structure. Using constants instead of hardcoded strings
 * improves code maintainability, readability, and reduces the risk of errors.
 * <p>
 * Point Types:
 * <ul>
 *     <li><strong>VERTEX:</strong> Represents a corner or defining point of a face.</li>
 *     <li><strong>ANNOTATED_POINT:</strong> Represents a user-defined annotation point within a face.</li>
 * </ul>
 */
public class PointType {

    /**
     * Represents a vertex point in the origami model.
     * <p>
     * This type defines a key structural point where edges meet. Vertex points
     * are essential for maintaining the shape of an origami face and typically
     * remain unchanged unless modified by a fold operation.
     */
    public static final String VERTEX = "vertex";

    /**
     * Represents an annotated point within an origami face.
     * <p>
     * This type is used for marking specific locations on an origami face,
     * such as user-defined annotations or guides. Annotated points are
     * purely informational and do not impact the structural integrity of the origami.
     */
    public static final String ANNOTATED_POINT = "annotated_point";
}