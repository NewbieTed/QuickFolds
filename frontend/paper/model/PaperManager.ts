/**
 * @fileoverview This file handles the bookkeeping of the sole static
 * instance of PaperGraph which represents the paper model currently
 * being viewed/edited. The file provides folding algorithms with
 * manipulate and update the paper; these are the only point of entry
 * which a caller can use to fold the currently opened origami in
 * the abstract mathematical sense, not considering any 3D rendering.
 */

import { Face2D } from "../geometry/Face2D";
import { Point2D } from "../geometry/Point";
import { createNewGraph, getFace2dFromId } from "./PaperGraph";


/**
 * Creates a new editor state for the paper graph
 */
export function startEditor() {
  createNewGraph();
}

/**
 * Adds an annotation point to the 2d graph
 * @param point2d - the point to add
 * @param faceId - the id of the face to add it
 * @returns true if success, or a string containing the error message
 */
export function graphAddAnnotationPoint(
  point2d : Point2D,
  faceId: bigint,
  ) : true | string {
  let face2D : Face2D | undefined = getFace2dFromId(faceId);
  if (face2D == undefined) {
    return "Face id does not exists";
  }

  face2D.addAnnotatedPoint(point2d);
  return true;
}

/**
 * Deletes an annotation point to the 2d graph
 * @param pointId  the id of the point to delete it
 * @param faceId - the id of the face to delete it
 * @returns true if success, or a string containing the error message
 */
export function graphDeleteAnnotationPoint(
  pointId : bigint,
  faceId: bigint,
  ) : AnnotationUpdate2D {
  let face2D : Face2D | undefined = getFace2dFromId(faceId);
  if (face2D == undefined) {
    return "Face id does not exists";
  }

  face2D.delAnnotatedPoint(pointId);
  return face2D.delAnnotatedPoint(pointId);
}

/**
 * Adds an annotation line to the 2d graph
 * @param point1Id - the id of the first point
 * @param point2Id - the id of the second point
 * @param faceId - the id of the face to add the line to
 * @returns true if success, or a string containing the error message
 */
export function graphAddAnnotatedLine(
  point1Id : bigint,
  point2Id : bigint,
  faceId: bigint,
  ) : true | string {
  let face2D : Face2D | undefined = getFace2dFromId(faceId);
  if (face2D == undefined) {
    return "Face id does not exists";
  }

  face2D.addAnnotatedLine(point1Id, point2Id);
  return true;
}

/**
 * delete an annotation line to the 2d graph
 * @param lineId - the id of the line
 * @param faceId - the id of the face to delete the line from
 * @returns true if success, or a string containing the error message
 */
export function graphDeleteAnnotatedLine(
  lineId : bigint,
  faceId: bigint,
  ) : true | string {
  let face2D : Face2D | undefined = getFace2dFromId(faceId);
  if (face2D == undefined) {
    return "Face id does not exists";
  }

  face2D.delAnnotatedLine(lineId);
  return true;
}