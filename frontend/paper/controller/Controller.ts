/**
 * @fileoverview This file implements the layer of connection between the
 * 3D world edited by UI and managed by SceneManager, and the 2D world
 * managed by PaperManager. The controller is further responsible for
 * making appropriate calls to backend through the RequestHandler.
 */

// import {getFace3dFromId} from "../view/SceneManager"
import {addAnnotationPointToDB} from "./RequestHandler";


// just give me the raycast shot point, and the plane it hit, i will calculate
// the rest (ie translated onto flat plane, 2d cal, etc)
async function addAnnotationPoint(point: Point3D, faceId: bigint) {
  // add points to frontend


  // todo: add locking here

  // add annotation point to face3d [ie in SceneManager]
  let face3d: Face3D = getFace3dFromId(faceId);
  let flattedPoint: Point3D = GeomeryModule.translatePointToFace(point, face3d);
  face3d.addAnnotatedPoint(flattedPoint);

  // add annotated point to face2d [ie in paper module]
  let face2d: Face2D = PaperModule.getFace2dFromId(faceId);
  let getTranslated2dPoint: Point2D = PaperModule.translate3dTo2d(flattedPoint);
  face2d.addAnnotatedPoint(getTranslated2dPoint);
  let result: boolean = await addAnnotationPointToDB(flattedPoint, faceId);


  SceneManager.IncrementStepID();
}

// assumption: point1 and point2 already exist via addAnnotatedPoint
// just give me the raycast shot point, and the plane it hit, i will calculate
// the rest
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