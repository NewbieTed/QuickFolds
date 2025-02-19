package com.quickfolds.backend.geometry.constants;

/**
 * Defines constant values representing different types of edges in an origami model.
 *
 * - Used to categorize edges based on their role in the folding structure.
 * - Prevents hardcoded string usage across the application, improving maintainability.
 *
 * Edge Types:
 * - `SIDE`: Represents a standard edge of a face.
 * - `FOLD`: Represents an edge created as part of a fold operation.
 */
public class EdgeType {
    /**
     * Represents a standard edge of an origami face.
     *
     * - Typically remains unchanged throughout the origami process.
     */
    public static final String SIDE = "side";

    /**
     * Represents an edge created during a fold operation.
     *
     * - Used to track edges that result from folding transformations.
     */
    public static final String FOLD = "fold";
}
