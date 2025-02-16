/**
 * The Serializer contains a list of method that return a JSON that gets send to backend for
 * the given request
 */

import { Point2D } from "../geometry/Point";
import { getOrigamiID, getStepID } from "../view/SceneManager";



/**
 * Formats the json request to add a new point
 * @param point - the new point to add
 * @param faceId - the id the face to add the point
 * @param pointId - the id of the point that is created
 * @param isPointOnEdge - the id of the edge the point is on, or null if not true
 * @returns JSON object to send to backend
 */
export function serializeAddPoint(point: Point2D, faceId: bigint, pointID: bigint, isPointOnEdge: bigint | null) {
  let origamiID: bigint = getOrigamiID();
  let stepID: bigint = getStepID();

  let faces = [{
    "idInOrigami": faceId,
    "annotations": {
      "points": [
                  {
                    "idInFace": pointID,
                    "x": 1.0,
                    "y": 2.0,
                    "onEdgeIdInFace": isPointOnEdge
                  }
                ],
      "lines": [],
      "deletedPoints": [],
      "deletedLines": []
    }
  }];

  let final = {
    "origamiId": origamiID,
    "stepIdInOrigami": stepID,
    "faces": faces
  }

  return final;
}

/**
 * Formats the json request to delete a point
 * @param faceId - the id the face to add the point
 * @param pointId - the id of the point that is created
 * @returns JSON object to send to backend
 */
export function serializeDeletePoint(faceId: bigint, pointID: bigint) {
  let origamiID: bigint = getOrigamiID();
  let stepID: bigint = getStepID();

  let faces = [{
    "idInOrigami": faceId,
    "annotations": {
      "points": [],
      "lines": [],
      "deletedPoints": [pointID],
      "deletedLines": []
    }
  }];

  let final = {
    "origamiId": origamiID,
    "stepIdInOrigami": stepID,
    "faces": faces
  }

  return final;
}


/**
 * Formats the json request to add a new line
 * @param point1Id - the id of the 1st point in the line segment that is created
 * @param point2Id - the id of the 2nd point in the line segment that is created
 * @param newAnnoLineId - the id of the line annotation
 * @param faceId - the id the face to add the point
 * @returns JSON object to send to backend
 */
export function serializeAddLine(point1Id: bigint, point2Id: bigint, newAnnoLineId: bigint, faceId: bigint) {
  let origamiID: bigint = getOrigamiID();
  let stepID: bigint = getStepID();

  let faces = [{
    "idInOrigami": faceId,
    "annotations": {
      "points": [],
      "lines": [
        {
          "idInFace": newAnnoLineId,
          "point1IdInOrigami": point1Id,
          "point2IdInOrigami": point2Id
        },
      ],
      "deletedPoints": [],
      "deletedLines": []
    }
  }];

  let final = {
    "origamiId": origamiID,
    "stepIdInOrigami": stepID,
    "faces": faces
  }

  return final;
}

/**
 * Formats the json request to delete a line
 * @param annoLineId - the id of the line annotation
 * @param faceId - the id the face to add the point
 * @returns JSON object to send to backend
 */
export function serializeDeleteLine(annoLineId: bigint, faceId: bigint | null) {
  let origamiID: bigint = getOrigamiID();
  let stepID: bigint = getStepID();

  let faces = [{
    "idInOrigami": faceId,
    "annotations": {
      "points": [],
      "lines": [],
      "deletedPoints": [],
      "deletedLines": [annoLineId]
    }
  }];

  let final = {
    "origamiId": origamiID,
    "stepIdInOrigami": stepID,
    "faces": faces
  }

  return final;
}