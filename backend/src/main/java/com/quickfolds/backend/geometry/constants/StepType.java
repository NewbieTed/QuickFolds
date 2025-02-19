package com.quickfolds.backend.geometry.constants;

/**
 * Defines constant values representing different step types in the origami process.
 *
 * - Used to categorize steps based on their function in the folding sequence.
 * - Prevents hardcoded string usage, improving maintainability and consistency.
 *
 * Step Types:
 * - `CREATE`: Represents the initial step of creating an origami model.
 * - `FOLD`: Represents a fold operation applied to the origami structure.
 * - `ANNOTATE`: Represents an annotation step where markings are added.
 */
public class StepType {
    /**
     * Represents the initial step of creating an origami model.
     *
     * - This step occurs when a new origami structure is initialized.
     */
    public static final String CREATE = "create";

    /**
     * Represents a fold operation in the origami process.
     *
     * - This step modifies the structure by folding a part of the origami.
     */
    public static final String FOLD = "fold";

    /**
     * Represents an annotation step in the origami process.
     *
     * - This step allows adding markings or notes to specific parts of the model.
     */
    public static final String ANNOTATE = "annotate";
}
