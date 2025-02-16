/**
 * @fileoverview This file manages the collection of Three.js objects being
 * rendered for the currently open origami. It is the single point of entry
 * from which callers can change the actually rendered paper, offering key
 * animation methods to display the 3D-rendered paper in motion.
 */

import { Face3D } from "../geometry/Face3D";

let stepID = 0n;
const origamiID = 0n;

let nextFaceId : bigint = -1n;
const idsToFaces : Map<bigint, Face3D> = new Map<bigint, Face3D>();

export function getFace3dFromId(faceId : bigint) {
    return idsToFaces.get(faceId);
}

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


/**
 * Gets the id of the next available face, also updates the counter
 * @returns the id of the new face
 */
export function getNextFaceID(): bigint {
    nextFaceId += 1n;
    return nextFaceId - 1n;
}
