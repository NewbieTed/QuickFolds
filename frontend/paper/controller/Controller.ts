/**
 * @fileoverview This file implements the layer of connection between the
 * 3D world edited by UI and managed by SceneManager, and the 2D world
 * managed by PaperManager. The controller is further responsible for
 * making appropriate calls to backend through the RequestHandler.
 */

import * as THREE from 'three';
import { AnnotationUpdate3D, Face3D } from "../geometry/Face3D";
import { AnnotationUpdate2D, Face2D } from '../geometry/Face2D'; // export Face 2d
import { createPoint2D, createPoint3D, Point3D, Point2D, AnnotatedLine, AnnotatedPoint3D, Point, processTransationFrom3dTo2d } from "../geometry/Point";
import {addUpdatedAnnoationToDB} from "./RequestHandler";
import {getFace2dFromId} from "../model/PaperGraph"
import { getFace3DByID, incrementStepID, updateFace } from '../view/SceneManager';
import { EditorStatus, EditorStatusType } from '../view/EditorMessage';

/**
 * Given a provided point (ie you can provided the layered shot, no need to
 * project), and a face id, updates all frontend systems and backend systems
 * with adding a new annotation point
 * @param point - the point to be added [note: will be projected onto face]
 * @param faceId - the face to add the point to
 * @returns either true, or a message about while the action failed
 */
export async function addAnnotationPoint(point: Point3D, faceId: bigint) : Promise<string | true> {
  // add points to frontend
  console.log("internal system face id: " + faceId);

  // add annotation point to face3d [ie in SceneManager]
  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    console.error("face 3d id doesn't exists");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  let flattedPoint: Point3D | null = projectPointToFace(point, face3d);
  if (flattedPoint == null) {
    console.error("Point creation isn't on plane");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }


  // add annotated point to face2d [ie in paper module]
  let face2d: Face2D | undefined = getFace2dFromId(faceId);
  if (face2d === undefined) {
    console.error("face 2d id doesn't exists");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }
  let getTranslated2dPoint: Point2D | null = translate3dTo2d(flattedPoint, faceId);
  if (getTranslated2dPoint == null) {
    console.error("Error translating to 2d");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  let addPointResult: AnnotationUpdate2D = face2d.addAnnotatedPoint(getTranslated2dPoint)
  if (addPointResult.status !== "NORMAL") {
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }
  if (addPointResult.pointsAdded.size !== 1) {
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  // create manual new update change, since we already know the 3d point
  let pointId: bigint = getaddPointFromResultMap(addPointResult);
  console.log("created point id", pointId);
  const renderUpdateResult = face3d.updateAnnotations(create3dAnnoationResultForNewPoint(pointId, flattedPoint));
  updateFace(renderUpdateResult);

  let result: boolean = await addUpdatedAnnoationToDB(addPointResult, faceId);

  if (!result) {
    const myStatus: EditorStatusType = "BACKEND_500_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  incrementStepID();
  return true;
}

/**
 * Given a provided point id, and face the point is in, updates all frontend systems
 * and backend systems with deleting the annotaiton point
 * Note: pointId cannot be apart of any annotated line, or it will return a fail
 * @param point - the point to be added [note: will be projected onto face]
 * @param faceId - the face to add the point to
 * @returns either true, or a message about while the action failed
 */
export async function deleteAnnotationPoint(pointId: bigint, faceId: bigint) : Promise<string | true>  {
  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    console.error("face 3d id doesn't exists");
    return "face 3d id doesn't exists";
  }

  let face2D : Face2D | undefined = getFace2dFromId(faceId);
  if (face2D == undefined) {
    return "Face id does not exists";
  }


  // check to make sure that we don't delete a vertex
  if (pointId < face3d.vertices.length) {
    return "Deleting a vertex";
  }


  // frontend changes
  let updateState2dResults: AnnotationUpdate2D = face2D.delAnnotatedPoint(pointId);
  const update3dObjectResults = convertAnnotationsForDeletes(updateState2dResults, faceId);
  if (update3dObjectResults == null) {
    return "Error: couldn't generated 3d updated object";
  }


  const renderingUpdateObjectResult = face3d.updateAnnotations(update3dObjectResults);
  updateFace(renderingUpdateObjectResult);


  // backend chagnes
  let result: boolean = await addUpdatedAnnoationToDB(updateState2dResults, faceId);
  if (!result) {
    console.error("Error occured with adding point to DB");
    return "Error occured with adding point to DB";
  }

  incrementStepID();
  return true;
}



/**
 * Given two provided point ids, and face the point is in, updates all frontend
 * and backend systems with creating a new annotation line
 * Note: system will return a fail if the same point is provided or
 *       annotation line already exists (ie you try to recreate an existing line)
 * @param point1Id - the id of a point in the line
 * @param point2Id - the id of the other point in the line
 * @param faceId - the id of the face the line is in
 * @returns either true, or a message about while the action failed
 */
export async function addAnnotationLine(point1Id: bigint, point2Id: bigint, faceId: bigint) : Promise<string | true>   {
  // add annotation point to face3d [ie in SceneManager]
  if (point1Id == point2Id) {
    return "Cannot click the same point"; // todo: update will fail
  }

  // get faces
  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    console.error("face 3d id doesn't exists");
    return "face 3d id doesn't exists";
  }

  let face2D : Face2D | undefined = getFace2dFromId(faceId);
  if (face2D == undefined) {
    return "Face id does not exists";
  }

  // check that we don't add an annotation line to the edge of the plane
  if (point1Id < face3d.vertices.length && point2Id < face3d.vertices.length) {
    return "Deleting a vertex";
  }

  // frontend changes
  let updateState2dResults: AnnotationUpdate2D = face2D.addAnnotatedLine(point1Id, point2Id);
  const update3dObjectResults = convertAnnotationsForDeletes(updateState2dResults, faceId);
  if (update3dObjectResults == null) {
    return "Error: couldn't generated 3d updated object";
  }

  const renderingUpdateObjectResult = face3d.updateAnnotations(update3dObjectResults);
  updateFace(renderingUpdateObjectResult);


  // backend chagnes
  let result: boolean = await addUpdatedAnnoationToDB(updateState2dResults, faceId);
  if (!result) {
    console.error("Error occured with adding point to DB");
    return "Error occured with adding point to DB";
  }

  incrementStepID();
  return true;
}


/**
 * Given an existing line id, and face the line is in, updates all frontend
 * and backend systems with deleting a new annotation line
 * @param lineId - the id of a point in the line
 * @param faceId - the id of the face the line is in
 * @returns either true, or a message about while the action failed
 */
export async function deleteAnnotationLine(lineId: bigint, faceId: bigint) : Promise<string | true> {
  // get faces
  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    console.error("face 3d id doesn't exists");
    return "face 3d id doesn't exists";
  }

  let face2D : Face2D | undefined = getFace2dFromId(faceId);
  if (face2D == undefined) {
    return "Face id does not exists";
  }

  // frontend changes
  let updateState2dResults: AnnotationUpdate2D = face2D.delAnnotatedLine(lineId);
  const update3dObjectResults = convertAnnotationsForDeletes(updateState2dResults, faceId);
  if (update3dObjectResults == null) {
    return "Error: couldn't generated 3d updated object";
  }

  const renderingUpdateObjectResult = face3d.updateAnnotations(update3dObjectResults);
  updateFace(renderingUpdateObjectResult);

  // backend chagnes
  let result: boolean = await addUpdatedAnnoationToDB(updateState2dResults, faceId);
  if (!result) {
    console.error("Error occured with adding point to DB");
    return "Error occured with adding point to DB";
  }

  incrementStepID();
  return true;
}



/**
 * Does translation from 2d udpate to 3d update. handles all parts of response object
 * @param update2D - the annotation update you want to convert
 * @param faceId - the id of the face this occurs at
 * @returns a 3d annotation update object based on one provided
 */
function convertAnnotationsForDeletes(update2D: AnnotationUpdate2D, faceId : bigint) : AnnotationUpdate3D | null {

	const newPointsMap = new Map<bigint, AnnotatedPoint3D>();
  for (let [pointId, pointObj2d] of update2D.pointsAdded) {

    const newPoint3d = translate2dTo3d(pointObj2d.point, faceId);
    if (newPoint3d == null) {
      return null;
    }

    const newAnnoPoint: AnnotatedPoint3D = {
      point: newPoint3d,
      edgeID: -1n, // update if on edge later
    };

    newPointsMap.set(pointId, newAnnoPoint);
  }



	const update3D = {
		pointsAdded: newPointsMap,
		pointsDeleted: update2D.pointsDeleted,
		linesAdded: update2D.linesAdded,
		linesDeleted: update2D.linesDeleted
	}

	return update3D
}



/**
 * Creates a 3d udpate result for creating exactly 1 new point, and no other status changes
 * @param newPointId - the id of the new point
 * @param newPoint3d - the 3d coordinates of the new point
 * @returns AnnotationUpdate3D containing the status containing this new point
 */
function create3dAnnoationResultForNewPoint(newPointId: bigint, newPoint3d: Point3D) : AnnotationUpdate3D {
  const newPointsMap = new Map<bigint, AnnotatedPoint3D>();
  const pointsDeleted: bigint[] = [];
  const linesAdded = new Map<bigint, AnnotatedLine>();
  const linesDeleted: bigint[] = [];

  const newAnnoPoint: AnnotatedPoint3D = {
    point: newPoint3d,
    edgeID: -1n, // update if on edge later
  };

  newPointsMap.set(newPointId, newAnnoPoint);
  const update: AnnotationUpdate3D = {
    pointsAdded: newPointsMap,
    pointsDeleted: pointsDeleted,
    linesAdded: linesAdded,
    linesDeleted: linesDeleted
  }

  return update;
}


/**
 * Given a AnnotationUpdate2D with 1 added point, return the id of the point
 * @param addPointResult - the result update to get the map from
 * @returns the id of the 1 point added, or -1 if no map
 */
function getaddPointFromResultMap(addPointResult: AnnotationUpdate2D) : bigint {
  for(let ids of addPointResult.pointsAdded.keys()) {
    return ids;
  }
  return -1n;
}


/**
 * takes a 3d point and projects it onto the face3d start position. intended for when hitting
 * a layer on the render since these planes have an offset
 * @param point - the point to be projected
 * @param face3d - the plane to be projected on
 * @returns - a Point3d that is projected on the plane, or null if it doesn't line up
 */
function projectPointToFace(point: Point3D, face3d: Face3D): Point3D | null {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < 3; i++) {
    points.push(new THREE.Vector3(face3d.vertices[0].x, face3d.vertices[0].y, face3d.vertices[0].z));
  }

  // idea is to create a plane as Three.js has a project point method
  const plane = new THREE.Plane();
  plane.setFromCoplanarPoints(points[0], points[1], points[2]);

  const projectedPoint = new THREE.Vector3();
  const originalPtThreeVerison = new THREE.Vector3(point.x, point.y, point.z);
  plane.projectPoint(originalPtThreeVerison, projectedPoint);

  // create our version of 3d point
  const translatedBackPt: Point3D = createPoint3D(projectedPoint.x,
                                                  projectedPoint.y,
                                                  projectedPoint.z
                                                );

  return translatedBackPt;
}

/**
 * take a 3d point on the layered version of face3d (given with faceid),
 * return the corresponding 2d point in the paper map version
 * @param point - the 3d point to translate to 2d
 * @param faceId - the faceId the point lines on
 * @returns the corresponding point2d, or null if the 3d point isn't on the face
 */
function translate3dTo2d(point: Point3D, faceId: bigint) : Point2D | null {
  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    console.error("face 3d id doesn't exists");
    return null;
  }
  let face2d: Face2D | undefined = getFace2dFromId(faceId);
  if (face2d === undefined) {
    console.error("face 2d id doesn't exists");
    return null;
  }

  return processTransationFrom3dTo2d(point, face3d, face2d);
}




/**
 * take a 3d point on the layered version of face3d (given with faceid),
 * return the corresponding 2d point in the paper map version
 * @param point - the 3d point to translate to 2d
 * @param faceId - the faceId the point lines on
 * @returns the corresponding point2d, or null if the 3d point isn't on the face
 */
function translate2dTo3d(point: Point2D, faceId: bigint) : Point3D | null {
  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    console.error("face 3d id doesn't exists");
    return null;
  }
  let face2d: Face2D | undefined = getFace2dFromId(faceId);
  if (face2d === undefined) {
    console.error("face 2d id doesn't exists");
    return null;
  }

  return processTranslate2dTo3d(point, face3d, face2d);
}


/**
 * calculates the new point to put in face 3d based on the provided point
 * and corresponding face 2d object
 * @param point - the point to translate into 3d
 * @param face3d - the face 3d object the point is is translated to
 * Note the id of both faces must match
 * @param face2d - the face 2d object the point is translated to
 * Note the id of both faces must match
 * @returns - the translated 2d point, or null if there is an error
 */
export function processTranslate2dTo3d(point: Point2D, face3d : Face3D, face2d: Face2D) : Point3D | null {
  let points : Point2D[] = [];
  for (let i = 0; i < 3; i++) {
    points.push(face2d.vertices[i]);
  }

  const basis1 : Point2D = createPoint2D(
    points[1].x - points[0].x,
    points[1].y - points[0].y,
  );

  console.log(basis1);

  const basis2 : Point2D = createPoint2D(
    points[2].x - points[0].x,
    points[2].y - points[0].y,
  );

  let basisResult = solve2dSystemForScalars(
    [basis1.x, basis1.y],
    [basis2.x, basis2.y],
    [point.x, point.y]
  );


  if (basisResult == null) {
    return null;
  }


  // because our problem is isometric, use the same coordinates for our
  // new basis vectors rotated on the 2d plane
  const point0in3D : Point3D = face3d.vertices[0];
  const point1in3D : Point3D = face3d.vertices[1];
  const point2in3D : Point3D = face3d.vertices[2];

  const basis1in3d : Point3D = createPoint3D(
    point1in3D.x - point0in3D.x,
    point1in3D.y - point0in3D.y,
    point1in3D.z - point0in3D.z
  );

  const basis2in3d : Point3D = createPoint3D(
    point2in3D.x - point0in3D.x,
    point2in3D.y - point0in3D.y,
    point2in3D.z - point0in3D.z
  );

  const coverted3dPoint = createPoint3D(
    basis1in3d.x * basisResult[0] +  basis2in3d.x * basisResult[1],
    basis1in3d.y * basisResult[0] +  basis2in3d.y * basisResult[1],
    basis1in3d.z * basisResult[0] +  basis2in3d.z * basisResult[1]
  );

  return coverted3dPoint;
}


/**
 * Given two vectors in 3d space, returns the scalars used to reach target,
 * another vector in three space
 *
 * av1 + bv2 = target
 * @param v1 - vector in 3space
 * @param v2 - other vector in 3space
 * @param target - target vector in 3space
 * @returns [a, b]
 */
function solve2dSystemForScalars(
  v1: [number, number],
  v2: [number, number],
  target: [number, number]
): [number, number] {
  const [x1, y1] = v1;
  const [x2, y2] = v2;
  const [tx, ty] = target;

  // Calculate the determinant
  const det = x1 * y2 - x2 * y1;

  if (det === 0) {
    throw new Error(
      "The vectors v1 and v2 are linearly dependent (det = 0). " +
      "No unique solution exists."
    );
  }

  // Solve for alpha and beta
  const alpha = (tx * y2 - ty * x2) / det;
  const beta = (-tx * y1 + ty * x1) / det;

  return [alpha, beta];
}

// /**
//  This is an old, outdated method
//  * Returns a boolean as to whether a given line exists
//  * @param point1Id - the id of point 1 in the line to check
//  * @param point2Id  - the id of point 2 in the line to check
//  * @param faceId - the face id this occurs in
//  * @returns Returns a boolean as to whether a given line exists
//  */
// function doesLineAlreadyExist(point1Id : bigint, point2Id : bigint, faceId : bigint) : boolean {
//   let face3d: Face3D | undefined = getFace3DByID(faceId);
//   if (face3d === undefined) {
//     console.error("face 3d id doesn't exists");
//     return false;
//   }

//   const lineIdMap : Map<bigint, AnnotatedLine> = face3d.annotatedLines; // fine, add map access
//   for (let lineObj of lineIdMap.values()) {
//     if ((lineObj.startPointID == point1Id || lineObj.startPointID == point2Id) &&
//         (lineObj.endPointID == point1Id || lineObj.endPointID == point2Id)) {
//       return true;
//     }
//   }
//   return false;
// }