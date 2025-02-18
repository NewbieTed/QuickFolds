/**
 * @fileoverview This file manages the collection of Three.js objects being
 * rendered for the currently open origami. It is the single point of entry
 * from which callers can change the actually rendered paper, offering key
 * animation methods to display the 3D-rendered paper in motion.
 */

import * as THREE from 'three';
import exp from "constants";
import { Face3D } from "../geometry/Face3D";
import { createNewGraph } from '../model/PaperGraph';

let stepID = 1n;
const origamiID = 1n; // BACKEND CHANGE

let nextFaceId : bigint = 1n;
const idsToFaces : Map<bigint, Face3D> = new Map<bigint, Face3D>();
const objToOurIds : Map<bigint, bigint> = new Map<bigint, bigint>();

export function startup(plane : Face3D, meshId : bigint) {
    idsToFaces.clear();
    objToOurIds.clear();
    idsToFaces.set(nextFaceId, plane);
    objToOurIds.set(meshId, nextFaceId);
    createNewGraph(nextFaceId);
    nextFaceId++;
    console.log("ID OF MESH" + meshId);
}


export function threeJSIdsToOurIds(threeJSId : bigint) : bigint | undefined{
    return objToOurIds.get(threeJSId);
}


/**
 * @param faceId - id of faceobject to get
 * @returns face3d object or undefined if no id exists
 */
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
