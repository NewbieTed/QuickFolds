/**
 * @fileoverview This file implements the layer of connection between the
 * 3D world edited by UI and managed by SceneManager, and the 2D world
 * managed by PaperManager. The controller is further responsible for
 * making appropriate calls to backend through the RequestHandler.
 */

// import {getFace3dFromId} from "../view/SceneManager"
import * as THREE from 'three';
import { Face3D } from "../geometry/Face3D";
import { Face2D } from '../geometry/Face2D'; // export Face 2d
import { createPoint3D, Point3D } from "../geometry/Point";
import {addAnnotationPointToDB} from "./RequestHandler";
import * as pt from "../geometry/Point";

// just give me the raycast shot point, and the plane it hit, i will calculate
// the rest (ie translated onto flat plane, 2d cal, etc)
async function addAnnotationPoint(point: Point3D, faceId: bigint) {
  // add points to frontend


  // todo: add locking here

  // add annotation point to face3d [ie in SceneManager]
  let face3d: Face3D = SceneManager.getFace3dFromId(faceId);
  let flattedPoint: Point3D | null = projectPointToFace(point, face3d);
  if (flattedPoint == null) {
    return; // update here
  }

  face3d.addAnnotatedPoint(flattedPoint);
  // add annotated point to face2d [ie in paper module]
  let face2d: Face2D = PaperModule.getFace2dFromId(faceId);
  let getTranslated2dPoint: Point2D = PaperModule.translate3dTo2d(flattedPoint); //?
  face2d.addAnnotatedPoint(getTranslated2dPoint);
  let result: boolean = await addAnnotationPointToDB(flattedPoint, faceId);


  SceneManager.IncrementStepID();
}


function translate3dTo2d(point: Point3D, face3d: Face3D, face2d: Face2D) {

  let counter: bigint = 0n;
  let idMap : Map<bigint, pt.AnnotatedPoint> = face3d.annotatedPoints;
  const keys : bigint[] = idMap.keys();

  for(let i = 0; i < 3; i++) {
    keys.
  }

  Map
  const ptOrigin: face3d
  const basis1 : Point3D = createPoint3D(p)
}

/**
 * takes a 3d point and projects it onto the face3d. intentend for when hitting
 * a layer on the render since these planes have an offset
 * @param point - the point to be projected
 * @param face3d - the plane to be projected on
 * @returns - a Point3d that is projected on the plane, or null if it doesn't line up
 */
function projectPointToFace(point: Point3D, face3d: Face3D): Point3D | null {
  const points: THREE.Vector3[] = [];

  // TODO: ask hady to give me 3 vertices
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

  if (!face3d.containedInFace(translatedBackPt)) {
    console.error("Point is not on plane when projected");
    return null;
  }
  return translatedBackPt;
}

/**
 * just give me the direct raycast shot point, and the plane it hit, i will calculate
 * the rest such as projecting
// adds annotation line to SceneManager, Paper Module, and Backend,
// return resuts of actions
 * @param point1 - the first point of ht to add the line to
 * @param point2 - the second point to add the line to
 * @remarks : point1 and point2 already exist via addAnnotatedPoint
 * @param faceId - the id of the face
 * @returns
 */
async function addAnnotationLine(point1: Point3D, point2: Point3D, faceId: bigint) {
  // add points to frontend

  // add annotation point to face3d [ie in SceneManager]
  let face3d: Face3D = getFace3dFromId(faceId);
  let face2d: Face2D = PaperModule.getFace2dFromId(faceId);

  let flattedPoint1: Point3D = GeomeryModule.translatePointToFace(point1, face3d);
  let getTranslated2dPoint1: Point2D = PaperModule.translate3dTo2d(flattedPoint1);

  let flattedPoint2: Point3D = GeomeryModule.translatePointToFace(point2, face3d);
  let getTranslated2dPoint2: Point2D = PaperModule.translate3dTo2d(flattedPoint2);

  // add annotated point to face2d [ie in paper module]
  let closestPointToPt1 : bigint = face2d.findNearestPoint(getTranslated2dPoint1);
  let closestPointToPt2 : bigint = face2d.findNearestPoint(getTranslated2dPoint2);

  if (closestPointToPt1 == closestPointToPt2) {
    return false; // todo: update will fail
  }


  // todo: check line doesn't already exist

  // TODO: where do i get the line id from face? do ids match up between face2d and 3d
  // need face id to send to back end
  let annotationLineId: bigint = null;

  let result: boolean = await addAnnotationLineToDB(closestPointToPt1, closestPointToPt2, annotationLineId, faceId);


  SceneManager.IncrementStepID();
}