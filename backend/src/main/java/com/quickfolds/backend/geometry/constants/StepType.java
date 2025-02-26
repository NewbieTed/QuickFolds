package com.quickfolds.backend.geometry.constants;

/**
 * Defines constant values representing different step types in the origami process.
 * <p>
 * This class provides string constants to categorize steps based on their role
 * within the folding sequence. Using constants instead of hardcoded strings
 * improves code maintainability, readability, and reduces the risk of errors.
 * <p>
 * Step Types:
 * <ul>
 *     <li><strong>CREATE:</strong> Represents the initial step of creating an origami model.</li>
 *     <li><strong>FOLD:</strong> Represents a fold operation applied to the origami structure.</li>
 *     <li><strong>ANNOTATE:</strong> Represents an annotation step where markings are added.</li>
 * </ul>
 */
public class StepType {

    /**
     * Represents the initial step of creating an origami model.
     * <p>
     * This step occurs when a new origami structure is initialized.
     * It typically includes defining the base shape or structure before
     * any folds or annotations are applied.
     */
    public static final String CREATE = "create";

    /**
     * Represents a fold operation in the origami process.
     * <p>
     * This step modifies the structure by folding a part of the origami.
     * It changes the geometry of the model and may introduce new faces and edges.
     */
    public static final String FOLD = "fold";

    /**
     * Represents an annotation step in the origami process.
     * <p>
     * This step allows adding markings or notes to specific parts of the model,
     * such as guidelines, labels, or user-defined highlights. Annotations
     * do not affect the structure of the origami.
     */
    public static final String ANNOTATE = "annotate";
}