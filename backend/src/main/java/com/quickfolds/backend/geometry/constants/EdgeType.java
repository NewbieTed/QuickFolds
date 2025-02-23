package com.quickfolds.backend.geometry.constants;

/**
 * Defines constant values representing different types of edges in an origami model.
 * <p>
 * This class provides string constants for categorizing edges based on their role
 * within the origami folding structure. Using constants instead of hardcoded strings
 * improves code maintainability, readability, and reduces the risk of errors.
 * <p>
 * Edge Types:
 * <ul>
 *     <li><strong>SIDE:</strong> Represents a standard edge of an origami face.</li>
 *     <li><strong>FOLD:</strong> Represents an edge created during a fold operation.</li>
 * </ul>
 */
public class EdgeType {

    /**
     * Represents a standard edge of an origami face.
     * <p>
     * This type is assigned to edges that form the boundary of an origami face.
     * These edges typically remain unchanged throughout the origami process unless
     * explicitly modified by folding operations.
     */
    public static final String SIDE = "side";

    /**
     * Represents an edge created during a fold operation.
     * <p>
     * This type is assigned to edges generated as a result of folding transformations.
     * These edges are temporary or structural, depending on the folding process,
     * and may change as folding progresses.
     */
    public static final String FOLD = "fold";
}