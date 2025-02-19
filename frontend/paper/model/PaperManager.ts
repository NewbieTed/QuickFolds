/**
 * @fileoverview This file handles the bookkeeping of the sole static
 * instance of PaperGraph which represents the paper model currently
 * being viewed/edited. The file provides folding algorithms with
 * manipulate and update the paper; these are the only point of entry
 * which a caller can use to fold the currently opened origami in
 * the abstract mathematical sense, not considering any 3D rendering.
 */

import { AnnotationUpdate2D, Face2D } from "../geometry/Face2D";
import { Point2D } from "../geometry/Point";
import { createNewGraph, getFace2dFromId } from "./PaperGraph";



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
