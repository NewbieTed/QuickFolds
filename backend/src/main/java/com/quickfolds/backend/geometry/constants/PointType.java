package com.quickfolds.backend.geometry.constants;

/**
 * Defines constant values representing different types of points in an origami model.
 *
 * - Used to categorize points based on their role in the geometric structure.
 * - Prevents hardcoded string usage across the application, improving maintainability.
 *
 * Point Types:
 * - `VERTEX`: Represents a corner or defining point of a face.
 * - `ANNOTATED_POINT`: Represents a user-defined annotation point within a face.
 */
public class PointType {
    /**
     * Represents a vertex point in the origami model.
     *
     * - Defines a key structural point where edges meet.
     * - Typically remains unchanged unless a fold operation modifies it.
     */
    public static final String VERTEX = "vertex";

    /**
     * Represents an annotated point within an origami face.
     *
     * - Used for marking specific locations on a face.
     * - Does not impact the structural integrity of the origami.
     */
    public static final String ANNOTATED_POINT = "annotated_point";
}
