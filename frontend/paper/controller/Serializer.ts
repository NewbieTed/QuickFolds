/**
 * The Serializer contains a list of method that return a JSON that gets send to backend for
 * the given request
 */

import { AnnotationUpdate2D } from "../geometry/Face2D";
import { Point2D } from "../geometry/Point";
import { getOrigamiID, getStepID } from "../view/SceneManager";

export function serializeResultChange(statusUpdate: AnnotationUpdate2D, faceId: bigint) {
  // creating JSON for adding points
  const addedPointsList: PointData[] = [];
  type PointData = {
    idInFace: number;
    x: number;
    y: number;
    onEdgeIdInFace: bigint | null;
  };

  for (const [pointId, pointObj] of statusUpdate.pointsAdded) {
    addedPointsList.push(
      {
        "idInFace": Number(pointId),
        "x": pointObj.point.x,
        "y": pointObj.point.y,
        "onEdgeIdInFace": pointObj.edgeID === -1n ? null : pointObj.edgeID
      }
    );
	}

  type LineData = {
    idInFace: number;
    point1IdInOrigami: number;
    point2IdInOrigami: number;
  };
  // for now, use pointdata type
  const addedLinesList: LineData[] = [];
  for (const [lineId, lineObj] of statusUpdate.linesAdded) {
    addedLinesList.push(
      {
        "idInFace": Number(lineId),
        "point1IdInOrigami": Number(lineObj.startPointID),
        "point2IdInOrigami": Number(lineObj.endPointID)
      }
    );
	}

  // need to cast to number
  const copyDelPoints: number[] = []
  for (let id of statusUpdate.pointsDeleted) [
    copyDelPoints.push(Number(id))
  ]

  const copyDelLines: number[] = []
  for (let id of statusUpdate.linesDeleted) [
    copyDelLines.push(Number(id))
  ]
  const faces = [{
    "idInOrigami": Number(faceId),
    "annotations": {
      "points": addedPointsList,
      "lines": addedLinesList,
      "deletedPoints": copyDelPoints,
      "deletedLines":copyDelLines
    }
  }];

  const origamiID: bigint = getOrigamiID();
  const stepID: bigint = getStepID();

  const final = {
    "origamiId": Number(origamiID),
    "stepIdInOrigami": Number(stepID),
    "faces": faces
  }

  return final;
}