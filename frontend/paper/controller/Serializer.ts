/**
 * The Serializer contains a list of method that return a JSON that gets send to backend for
 * the given request
 */

import { AnnotationUpdate2D, Face2D } from "../geometry/Face2D.js";
import { EdgesAdjList, getAdjList } from "../model/PaperGraph.js";
import { getOrigamiID, getStepID } from "../view/SceneManager.js";


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

/**
 * creates json edges for face fold
 * @param face- the face to get the edge from
 * @returns - the json format for the edges under /fold {face:...} request
 */
function processEdges(face: Face2D) {
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
      "angle": Number(curr.angleBetweenThem)
    };
  }

  return retList;
}

/**
 * creates json annotation points for face fold
 * @param face- the face to get the annotation points from
 * @returns - the json format for the annotation points under /fold {face:...} request
 */
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

/**
 * creates json annotation lines for face fold
 * @param face- the face to get the annotation lines from
 * @returns - the json format for the annotation lines under /fold {face:...} request
 */
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

/**
 * Formats the JSON for merging two planes together when updating backend via API
 * @param leftFaceId - the id of the first face to merge
 * @param rightFaceId - the id of the second face to merge
 * @param mergedFace - the new Merged faces
 * @returns the JSON format to send to /fold
 */
export function serializeMergeFold(leftFaceId: bigint, rightFaceId: bigint, mergedFace: Face2D) {
  // create two new faces
  const faces: any[] = [
    { // face left
      "idInOrigami": Number(mergedFace.ID),
      "vertices": processVertex(mergedFace),
      "edges": processEdges(mergedFace),
      "annotations": {
        "points": processAnnoPoints(mergedFace),
        "lines": processAnnoLines(mergedFace)
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
    "anchoredFaceIdInOrigami": Number(mergedFace.ID),
    "faces": faces,
    "deletedFaces": [Number(leftFaceId), Number(rightFaceId)]
  }


  return finalHeader;
}

/**
 *  Formats the JSON for splitting a plane together when updating backend via API
 * @param leftFace - the new split first face obj
 * @param rightFace - the new split second face obj
 * @param ogFaceId - the id of the face that got split
 * @param anchoredFaceIdInOrigami - the id of the new origami that states stationary
 * @returns
 */
export function serializeSplitFold(facesList: Face2D[], deletedFaces: bigint[], anchoredFaceIdInOrigami: bigint) {

  // create two new faces
  const faces: any[] = [];

  // add all faces
  for(let i = 0; i < facesList.length; i++) {
    const currFace = facesList[i];
    faces.push(
      { // face left
        "idInOrigami": Number(currFace.ID),
        "vertices": processVertex(currFace),
        "edges": processEdges(currFace),
        "annotations": {
          "points": processAnnoPoints(currFace),
          "lines": processAnnoLines(currFace)
        }
      }
    );
  }


  // put all deletedFaces
  const deletedFacesList: Number[] = [];
  for(let i = 0; i < deletedFaces.length; i++) {
    deletedFacesList.push(Number(deletedFaces[i]));
  }



    // ,

    // { // face right
    //   "idInOrigami": Number(rightFace.ID),
    //   "vertices": processVertex(rightFace),
    //   "edges": processEdges(rightFace),
    //   "annotations": {
    //     "points": processAnnoPoints(rightFace),
    //     "lines": processAnnoLines(rightFace)
    //   }
    // }



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
    "deletedFaces": deletedFacesList
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