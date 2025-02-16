/**
 * @fileoverview This file manages the collection of Three.js objects being
 * rendered for the currently open origami. It is the single point of entry
 * from which callers can change the actually rendered paper, offering key
 * animation methods to display the 3D-rendered paper in motion.
 */

let stepID = 0n;
const origamiID = 0n;

/**
 * Gets the current step id we are on. does not update the step counter, just peeks
 * @returns current step id
 */
export function getStepID() {
    return stepID;
}

/**
 * @returns origami id editor is working on
 */
export function getOrigamiID() {
    return origamiID;
}

/**
 * Increases the current step counter
 */
export function incrementStepID() {
    stepID++;
}


//TODO: counter
export function getNextFaceID(): bigint {
    return 0n;
}
