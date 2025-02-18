/**
 * @fileoverview This file implements the layer of connection between the
 * 3D world edited by UI and managed by SceneManager, and the 2D world
 * managed by PaperManager. The controller is further responsible for
 * making appropriate calls to backend through the RequestHandler.
 */

import * as THREE from 'three';
import { AnnotationUpdate3D, Face3D } from "../geometry/Face3D";
import { AnnotationUpdate2D, Face2D } from '../geometry/Face2D'; // export Face 2d
import { createPoint2D, createPoint3D, Point3D, Point2D, AnnotatedLine, AnnotatedPoint3D } from "../geometry/Point";
import {addUpdatedAnnoationToDB} from "./RequestHandler";
import {getFace2dFromId} from "../model/PaperGraph"
import { graphAddAnnotationPoint } from '../model/PaperManager';
import { getFace3dFromId, incrementStepID } from '../view/SceneManager';

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
  let face3d: Face3D | undefined = getFace3dFromId(faceId);
  if (face3d === undefined) {
    console.error("face 3d id doesn't exists");
    return "face 3d id doesn't exists";
  }

  let flattedPoint: Point3D | null = projectPointToFace(point, face3d);
  if (flattedPoint == null) {
    console.error("Point creation isn't on plane");
    return "Point creation isn't on plane";
  }


  // add annotated point to face2d [ie in paper module]
  let face2d: Face2D | undefined = getFace2dFromId(faceId);
  if (face2d === undefined) {
    console.error("face 2d id doesn't exists");
    return "face 2d id doesn't exists";
  }
  let getTranslated2dPoint: Point2D | null = translate3dTo2d(flattedPoint, faceId);
  if (getTranslated2dPoint == null) {
    console.error("Error translating to 2d");
    return "Error translating to 2d";
  }

  let addPointResult: AnnotationUpdate2D = face2d.addAnnotatedPoint(getTranslated2dPoint)
  if (addPointResult.status !== "NORMAL") {
    return "Error creating 2d point:" + addPointResult.status;
  }
  if (addPointResult.pointsAdded.size !== 1) {
    return "Didn't add 1 point, added: " + addPointResult.pointsAdded.size;
  }

  // create manual new update change, since we already know the 3d point
  let pointId: bigint = getaddPointFromResultMap(addPointResult);
  face3d.updateAnnotations(create3dAnnoationResultForNewPoint(pointId, flattedPoint));

  let result: boolean = await addUpdatedAnnoationToDB(addPointResult, faceId);

  if (!result) {
    console.error("Error occured with adding point to DB");
    return "Error occured with adding point to DB";
  }


  // let frontendResult : true | string = graphAddAnnotationPoint(getTranslated2dPoint, faceId);
  // if (frontendResult !== true) {
  //   console.error(frontendResult);
  //   return frontendResult;
  // }

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
  let face3d: Face3D | undefined = getFace3dFromId(faceId);
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
  face3d.updateAnnotations(convertAnnotationsForDeletes(updateState2dResults));

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
  let face3d: Face3D | undefined = getFace3dFromId(faceId);
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
  face3d.updateAnnotations(convertAnnotationsForDeletes(updateState2dResults));

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
async function deleteAnnotationLine(lineId: bigint, faceId: bigint) : Promise<string | true> {
  // get faces
  let face3d: Face3D | undefined = getFace3dFromId(faceId);
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
  face3d.updateAnnotations(convertAnnotationsForDeletes(updateState2dResults));

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
 * Does translation from 2d udpate to 3d update for
 * @param update2D
 * @returns
 */
function convertAnnotationsForDeletes(update2D: AnnotationUpdate2D) : AnnotationUpdate3D {

	const pointsAdded = new Map();
	const update3D = {
		pointsAdded: pointsAdded,
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
 * put in geometery module
 * Given two basis vectors in 3 space, and a target point,
 * returns the coordinates using the basis to get to the target point,
 * or null if there is no solution
 *
 *  |x1|    |x2|   |bx|
 * u|y1| + v|y2| = |by|
 *  |z1|    |z2|   |bz|
 *
 * where the function returns {u, v}
 *
 *
 * @param x1 - basis 1 x value
 * @param y1 - basis 1 y value
 * @param z1 - basis 1 z value
 * @param x2 - basis 2 x value
 * @param y2 - basis 2 y value
 * @param z2 - basis 2 z value
 * @param bx - target x value
 * @param by - target y value
 * @param bz - target z value
 * @returns  given ux + vy = b; where u, v, b in R3. returns {u, v} or null if no sol
 */
export function solveBasisSystem(
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  bx: number, by: number, bz: number
): { alpha: number, beta: number } | null{

  // Calculate the determinant of the coefficient matrix
  const det = x1 * y2 - x2 * y1;

  // Use Cramer's rule to calculate alpha and beta
  const detAlpha = bx * y2 - x2 * by;  // Replace first column with bx, by
  const detBeta = x1 * bz - bx * z1;   // Replace second column with bx, bz

  const alpha = detAlpha / det;
  const beta = detBeta / det;

  // system is overdetermined, so check that z values match
  if (Math.abs((z1 * alpha + z2 * beta) - bz) > 0.01) {
    return null; // system undetermined
  }

  return { alpha, beta };
}



/**
 * Solve a * v1 + b * v2 = t for scalars a, b in R^3.
 *
 * If a solution exists, returns [a, b].
 * If no solution exists (i.e. t is not in the plane spanned by v1, v2),
 * or if v1, v2 are collinear (no unique solution), returns null.
 */
function solveForScalars(
  v1: [number, number, number],
  v2: [number, number, number],
  t: [number, number, number]
): [number, number] {
  // Cross product helper
  function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  // Dot product helper
  function dot(a: [number, number, number], b: [number, number, number]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  // Normal vector n = v1 x v2
  const n = cross(v1, v2);

  // |v1 x v2|^2
  const denom = dot(n, n);

  // a = ((t x v2) ⋅ (v1 x v2)) / |v1 x v2|^2
  const tXv2 = cross(t, v2);
  const a = dot(tXv2, n) / denom;

  // b = -((t x v1) ⋅ (v1 x v2)) / |v1 x v2|^2
  const tXv1 = cross(t, v1);
  const b = -dot(tXv1, n) / denom;

  return [a, b];
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
 * PUT in PaperModule
 * take a 3d point on the layered version of face3d (given with faceid),
 * return the corresponding 2d point in the paper map version
 * @param point - the 3d point to translate to 2d
 * @param faceId - the faceId the point lines on
 * @returns the corresponding point2d, or null if the 3d point isn't on the face
 */
function translate3dTo2d(point: Point3D, faceId: bigint) : Point2D | null {
  let face3d: Face3D | undefined = getFace3dFromId(faceId);
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

export function processTransationFrom3dTo2d(point: Point3D, face3d : Face3D, face2d: Face2D) {
  let points : Point3D[] = [];
  //let pointsId : bigint[] = [];
  for (let i = 0; i < 3; i++) {
    points.push(face3d.vertices[i]);
    // pointsId.push(pointId);
  }

  const basis1 : Point3D = createPoint3D(
    points[1].x - points[0].x,
    points[1].y - points[0].y,
    points[1].z - points[0].z,
  );

  console.log(basis1);

  const basis2 : Point3D = createPoint3D(
    points[2].x - points[0].x,
    points[2].y - points[0].y,
    points[2].z - points[0].z,
  );

  console.log(basis2);

  let basisResult = solveForScalars(
  [basis1.x, basis1.y, basis2.z],
  [basis2.x, basis2.y, basis2.z],
  [point.x, point.y, point.z]
  );


  if (basisResult == null) {
    return null;
  }


  // because our problem is isometric, use the same coordinates for our
  // new basis vectors rotated on the 2d plane
  const point0in2D : Point2D = face2d.vertices[0];
  const point1in2D : Point2D = face2d.vertices[1];
  const point2in2D : Point2D = face2d.vertices[2];

  const basis1in2d : Point2D = createPoint2D(
    point1in2D.x - point0in2D.x,
    point1in2D.y - point0in2D.y
  );

  const basis2in2d : Point2D = createPoint2D(
    point2in2D.x - point0in2D.x,
    point2in2D.y - point0in2D.y
  );

  const coverted2dPoint = createPoint2D(
    basis1in2d.x * basisResult[0] +  basis2in2d.x * basisResult[1],
    basis1in2d.y * basisResult[0] +  basis2in2d.y * basisResult[1],
  );

  return coverted2dPoint;
}




// /**
//  * Returns a boolean as to whether a given line exists
//  * @param point1Id - the id of point 1 in the line to check
//  * @param point2Id  - the id of point 2 in the line to check
//  * @param faceId - the face id this occurs in
//  * @returns Returns a boolean as to whether a given line exists
//  */
// function doesLineAlreadyExist(point1Id : bigint, point2Id : bigint, faceId : bigint) : boolean {
//   let face3d: Face3D | undefined = getFace3dFromId(faceId);
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

/**
 * @param a - the first value to check
 * @param b - the second value to check
 * @returns BigInt(min(a, b))
 */
function intMin(a: bigint, b: bigint) : bigint {
  if (a < b) {
    return a;
  }
  return b;
}

/**
 * @param a - the first value to check
 * @param b - the second value to check
 * @returns BigInt(max(a, b))
 */
function intMax(a: bigint, b: bigint) : bigint {
  if (a > b) {
    return a;
  }
  return b;
}