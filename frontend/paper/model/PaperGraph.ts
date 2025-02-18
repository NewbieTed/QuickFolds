/**
 * @fileoverview This file is an implementation of a graph of 2DFace objects
 * with public methods to manipulate the graph at a basic level.
 */

import { Face2D } from "../geometry/Face2D";
import { createPoint2D } from "../geometry/Point";

// const STARTING_PLANE_ID : bigint = 1n; // BACKEND CHANGE
const idsToFaces : Map<bigint, Face2D> = new Map<bigint, Face2D>();


/**
 * Returns a specified element from the id<->F2d mappnig. If the value that is associated
 * to the provided key is an existing id, the corresponding Face2D will be returned.
 * then you will get a reference to that object and any
 * change made to that object will effectively modify it inside the Map.
 * @param faceId - the id of the face2d you want
 * @returns  Returns the element associated with the specified key.
 * If no element is associated with the specified id, undefined is returned.
 */
export function getFace2dFromId(faceId : bigint) {
  console.log(idsToFaces);
  return idsToFaces.get(faceId);
}

/**
 * Creates a new graph on 2d side, mainly should be used when starting editor
 */
export function createNewGraph(startingPlaneId: bigint) {
  idsToFaces.clear();
  idsToFaces.set(startingPlaneId, new Face2D(
    [
      createPoint2D(0, 0),
      createPoint2D(1, 0),
      createPoint2D(1, 1),
      createPoint2D(0, 1),
    ]
  )); // big face
}

