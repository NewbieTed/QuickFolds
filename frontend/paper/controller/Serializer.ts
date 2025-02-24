/**
 * The Serializer contains a list of method that return a JSON that gets send to backend for
 * the given request
 */

import { AnnotationUpdate2D, Face2D } from "../geometry/Face2D";
import { EdgesAdjList, getAdjList } from "../model/PaperGraph";
import { getOrigamiID, getStepID } from "../view/SceneManager";


/**
 * creates json vertex for face fold
 * @param face - the face to return the json vertices portion
 */
function processVertex(face: Face2D) {
  const retList: any[] = []
  for(let i = 0n; i < face.N; i++) {
    retList.push(
      {
        "x": face.getPoint(i).x,
        "y": face.getPoint(i).y
      }
    );
  }

  return retList;
}


function processEdges(face: Face2D, angle: bigint) {
  const adjList : Map<bigint, EdgesAdjList[]> = getAdjList();
  const list: EdgesAdjList[] | undefined = adjList.get(face.ID);

  if (list === undefined) {
    throw new Error();
  }

  const retList: any[] = []

  // create empty spots, then fill with adj list
  for(let i = 0n; i < face.N; i++) {
    retList.push(null);
  }

  // add all values of existing connections
  for(let i = 0; i < list.length; i++) {
    const curr: EdgesAdjList = list[i];

    retList[Number(curr.edgeIdOfMyFace)] = {
      "idInOtherFace": Number(curr.edgeIdOfOtherFace), // edge id
      "otherFaceIdInOrigami": Number(curr.idOfOtherFace), // other face id
      "angle": Number(angle)
    };
  }

  return retList;
}


function processAnnoPoints(face: Face2D) {
  const retList: any[] = [];
  for (const [pointId, pointObj] of face.getAnnotatedPointMap()) {
    retList.push({
      "idInFace": Number(pointId),
      "x": pointObj.point.x,
      "y": pointObj.point.y,
      "onEdgeId": pointObj.edgeID === -1n ? null : Number(pointObj.edgeID)
    });
  }

  return retList;
}

function processAnnoLines(face: Face2D) {
  const retList: any[] = [];
  for (const [lineId, lineObj] of face.getAnnotatedLinesMap()) {
    retList.push({
      "idInFace": Number(lineId),
      "point1IdInOrigami": Number(lineObj.startPointID),
      "point2IdInOrigami": Number(lineObj.endPointID)
    });
  }

  return retList;
}


export function serializeSplitFold(leftFace: Face2D, rightFace: Face2D, ogFaceId: bigint, angle: bigint, anchoredFaceIdInOrigami: bigint) {

  // create two new faces
  const faces: any[] = [
    { // face left
      "idInOrigami": Number(leftFace.ID),
      "vertices": processVertex(leftFace),
      "edges": processEdges(leftFace, angle),
      "annotations": {
        "points": processAnnoPoints(leftFace),
        "lines": processAnnoLines(leftFace)
      }
    },

    { // face right
      "idInOrigami": Number(rightFace.ID),
      "vertices": processVertex(rightFace),
      "edges": processEdges(rightFace, angle),
      "annotations": {
        "points": processAnnoPoints(rightFace),
        "lines": processAnnoLines(rightFace)
      }
    }
  ];



  const oriId = getOrigamiID();
  if (oriId === null) {
    throw new Error("ERROR GETTING ORIGAMI ID");

  }
  const origamiID: bigint = BigInt(oriId);
  const stepID: bigint = getStepID();

  const finalHeader = {
    "origamiId": Number(origamiID),
    "stepIdInOrigami": Number(stepID),
    "anchoredFaceIdInOrigami": Number(anchoredFaceIdInOrigami),
    "faces": faces,
    "deletedFaces": [Number(ogFaceId)]
  }


  return finalHeader;
}

/**
 * takes a status update, and the id of the face this occurs,
 * and returns the /geometry/annotate api json format
 * @param statusUpdate - the status update to format into json
 * @param faceId - the id of the face the status update occurs
 * @returns the json format to send to backend
 */
export function serializeResultChange(statusUpdate: AnnotationUpdate2D, faceId: bigint) {
  // creating JSON for adding points
  const addedPointsList: PointData[] = [];
  type PointData = {
    idInFace: number;
    x: number;
    y: number;
    onEdgeIdInFace: number | null;
  };

  for (const [pointId, pointObj] of statusUpdate.pointsAdded) {
    addedPointsList.push(
      {
        "idInFace": Number(pointId),
        "x": pointObj.point.x,
        "y": pointObj.point.y,
        "onEdgeIdInFace": pointObj.edgeID === -1n ? null : Number(pointObj.edgeID)
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

  const oriId = getOrigamiID();
  if (oriId === null) {
    throw new Error("ERROR GETTING ORIGAMI ID");

  }
  const origamiID: bigint = BigInt(oriId);
  const stepID: bigint = getStepID();

  const final = {
    "origamiId": Number(origamiID),
    "stepIdInOrigami": Number(stepID),
    "faces": faces
  }

  return final;
}