




export function serializeAddPoint(point: Point2D, faceId: bigint, pointID: bigint, isPointOnEdge: bigint | null) {
  let origamiID: bigint = SceneManager.getOrigamiID();
  let stepID: bigint = SceneManager.getStepID();

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



export function serializeAddLine(point1Id: bigint, point2Id: bigint, newAnnoLineId: bigint, faceId: bigint | null) {
  let origamiID: bigint = SceneManager.getOrigamiID();
  let stepID: bigint = SceneManager.getStepID();

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