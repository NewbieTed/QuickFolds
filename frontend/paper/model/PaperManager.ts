/**
 * @fileoverview This file handles the bookkeeping of the sole static
 * instance of PaperGraph which represents the paper model currently
 * being viewed/edited. The file provides folding algorithms with
 * manipulate and update the paper; these are the only point of entry
 * which a caller can use to fold the currently opened origami in
 * the abstract mathematical sense, not considering any 3D rendering.
 */

import { translate2dTo3d } from "../controller/Controller";
import { AnnotationUpdate2D, Face2D } from "../geometry/Face2D";
import { AnnotationUpdate3D, Face3D, FaceUpdate3D } from "../geometry/Face3D";
import { add, AnnotatedLine, AnnotatedPoint2D, AnnotatedPoint3D, createPoint2D, dotProduct, Point, Point2D, Point3D } from "../geometry/Point";
import { addFace, deleteFace, getFace3DByID } from "../view/SceneManager";
import { add2dFaceToPaperGraph, createNewGraph, delete2dFaceToPaperGraph, getFace2dFromId, print2dGraph, updateAdjListForSplitGraph } from "./PaperGraph";



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



export function graphCreateNewFoldSplit(point1Id: bigint, point2Id: bigint, faceId: bigint, angle: bigint) {
  let face2d: Face2D | undefined = getFace2dFromId(faceId);
  if (face2d === undefined) {
    return false;
  }

  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    return false;
  }

  // get the ids so that we get the first edge first so that way we can create a new face
  // in the right order
  const [[minEdgePointId, firstEdgeId], [maxEdgePointId, secondEdgeId]]: [[bigint, bigint], [bigint, bigint]] = getPointEdgeOrder(point1Id, point2Id, faceId);


  const dangerousLineID: bigint = face2d.addRawAnnotatedLine(point1Id, point2Id)

  // first we need to delete all the colinear lines between our "edge"
  const listOfLinesToDelete = getColinearLine(dangerousLineID, face2d);
  listOfLinesToDelete.forEach(lineId => face2d.delAnnotatedLine(lineId));

  const listOfHangingPointsToDelete = getHangingPointsOnLine(dangerousLineID, face2d);
  listOfHangingPointsToDelete.forEach(pointId => face2d.delAnnotatedPoint(pointId));
  face2d.delAnnotatedLine(dangerousLineID);

  // now that we got rid of the annoying stuff in our split line, we can now create a line that intersects
  // the content
  // gets list of stuff that intersects
  // the points added need to be put to both, and the lines added shouldn't be included since that's
  // the edge line
  const addedLineUpdates: AnnotationUpdate2D = face2d.addAnnotatedLine(point1Id, point2Id);

  // add the points of the fold line too
  // addedLineUpdates.pointsAdded.set(point1Id, face2d.getAnnotatedPoint(point1Id));
  // addedLineUpdates.pointsAdded.set(point2Id, face2d.getAnnotatedPoint(point2Id));

  if (addedLineUpdates.status !== "NORMAL") {
    return false;
  }

  // now we create the two faces, so we can add the pt/lines to it
  const [[leftFace, leftFace3d, leftFacePointIdFromOG, foldEdgeIdLeft],
         [rightFace, rightFace3d, rightFacePointIdFromOG, foldEdgeIdRight],
         vectorTowardsLeftFaceBasedOnOgPointIds] =

    createSplitFace([minEdgePointId, firstEdgeId], [maxEdgePointId, secondEdgeId], face2d, face3d);


  // now that we have the basic faces split, it's time to update the adj list with the
  // update edges of the new faces

  updateAdjListForSplitGraph(
    faceId,
    [leftFace.ID, foldEdgeIdLeft, leftFacePointIdFromOG],
    [rightFace.ID, foldEdgeIdRight, rightFacePointIdFromOG],
    angle
  );


  // now we need to add the points that should be duplicated on both sides
  // these are leftFacePointIdFromOG and rightFacePointIdFromOG, have all the vertex mapped

  // add the points that should be on both left and right
  // add all the points on the left
  for(const id of addedLineUpdates.pointsAdded.keys()) {
    const pointToAdd: Point2D = face2d.getPoint(id);
    const listOfIds: Map<bigint, AnnotatedPoint2D> =  leftFace.addAnnotatedPoint(pointToAdd, foldEdgeIdLeft).pointsAdded;
    if (listOfIds.size != 1) {
      throw new Error("Didn't add 1 new point");
    }

    // add the one new point to the mapping for lines later
    for(const newId of listOfIds.keys()) {
      leftFacePointIdFromOG.set(id, newId);
    }

  }
  // add all the points on the right
  for(const id of addedLineUpdates.pointsAdded.keys()) {
    const pointToAdd: Point2D = face2d.getPoint(id);
    const listOfIds: Map<bigint, AnnotatedPoint2D> =  rightFace.addAnnotatedPoint(pointToAdd, foldEdgeIdRight).pointsAdded;
    if (listOfIds.size != 1) {
      throw new Error("Didn't add 1 new point");
    }

    // add the one new point to the mapping for lines later
    for(const newId of listOfIds.keys()) {
      rightFacePointIdFromOG.set(id, newId);
    }
  }



  // now add all the points on only one of the faces
  const listOfDoubleOgPoints: bigint[] = Array.from(addedLineUpdates.pointsAdded.keys());
  for(const [pointIdOfOg, pointObjOfOg] of face2d.getAnnotatedPointMap()) {
    // only add point if we didn't do it before and it's NOT AN EDGE POINT
    if (!listOfDoubleOgPoints.includes(pointIdOfOg) && pointIdOfOg !== point1Id && pointIdOfOg !== point2Id) {
      if (isPointOnLeftFace(vectorTowardsLeftFaceBasedOnOgPointIds, pointIdOfOg, face2d)) {
        // add to left face
        const pointToAdd: AnnotatedPoint2D = face2d.getAnnotatedPoint(pointIdOfOg);


        // get the correct edge id on the new face
        let pointOnEdgeIdOfNewPlane: bigint | undefined = leftFacePointIdFromOG.get(pointObjOfOg.edgeID);
        // if no edge found, then we aren't touching one (since -1 gives undefined)
        if (pointOnEdgeIdOfNewPlane === undefined) {
          pointOnEdgeIdOfNewPlane = -1n;
        }


        const listOfIds: Map<bigint, AnnotatedPoint2D> =  leftFace.addAnnotatedPoint(pointToAdd.point, pointOnEdgeIdOfNewPlane).pointsAdded;
        if (listOfIds.size != 1) {
          throw new Error("Didn't add 1 new point");
        }

        // add the one new point to the mapping for lines later
        for(const newId of listOfIds.keys()) {
          leftFacePointIdFromOG.set(pointIdOfOg, newId);
        }
      } else {
        // add to right face
        const pointToAdd: AnnotatedPoint2D = face2d.getAnnotatedPoint(pointIdOfOg);


        // get the correct edge id on the new face
        let pointOnEdgeIdOfNewPlane: bigint | undefined = rightFacePointIdFromOG.get(pointObjOfOg.edgeID);
        // if no edge found, then we aren't touching one (since -1 gives undefined)
        if (pointOnEdgeIdOfNewPlane === undefined) {
          pointOnEdgeIdOfNewPlane = -1n;
        }


        const listOfIds: Map<bigint, AnnotatedPoint2D> =  rightFace.addAnnotatedPoint(pointToAdd.point, pointOnEdgeIdOfNewPlane).pointsAdded;
        if (listOfIds.size != 1) {
          throw new Error("Didn't add 1 new point");
        }

        // add the one new point to the mapping for lines later
        for(const newId of listOfIds.keys()) {
          rightFacePointIdFromOG.set(pointIdOfOg, newId);
        }
      }
    }
  }


  // now add all the annotationlines
  const listOfLinesOnFoldEdge: bigint[] = Array.from(addedLineUpdates.linesAdded.keys());
  const leftFacePoints: bigint[] = Array.from(leftFacePointIdFromOG.keys());
  const rightFacePoints: bigint[] = Array.from(rightFacePointIdFromOG.keys());
  for(const [lineId, lineIdObj] of face2d.getAnnotatedLinesMap()) {
    // only add line if not colinear
    if(!listOfLinesOnFoldEdge.includes(lineId)) {
      // these lines should only be in either left face or right face, so if I check
      // whether the points exists in my map for both, then i can add
      // only one if statement should occur
      if(leftFacePoints.includes(lineIdObj.startPointID) &&
         leftFacePoints.includes(lineIdObj.endPointID)) {

        // left face has both points, so make a new line
        const startPointForNewFace: bigint | undefined = leftFacePointIdFromOG.get(lineIdObj.startPointID);
        const endPointForNewFace: bigint | undefined = leftFacePointIdFromOG.get(lineIdObj.startPointID);
        if (startPointForNewFace === undefined || endPointForNewFace === undefined) {
          throw new Error("create points map for left face missed something");
        }
        leftFace.addAnnotatedLine(startPointForNewFace, endPointForNewFace);
      }
      if(rightFacePoints.includes(lineIdObj.startPointID) &&
         rightFacePoints.includes(lineIdObj.endPointID)) {

        // right face has both points, so make a new line
        const startPointForNewFace: bigint | undefined = rightFacePointIdFromOG.get(lineIdObj.startPointID);
        const endPointForNewFace: bigint | undefined = rightFacePointIdFromOG.get(lineIdObj.startPointID);
        if (startPointForNewFace === undefined || endPointForNewFace === undefined) {
          throw new Error("create points map for right face missed something");
        }
        rightFace.addAnnotatedLine(startPointForNewFace, endPointForNewFace);
      }
    }

  }


  // ok our faces are fully created, we need the copy the annotations to the 3d version
  const leftFace3dAnnoRes: AnnotationUpdate3D = copyAllAnnotationsFrom2dTo3d(faceId, leftFace);
  leftFace3d.updateAnnotations(leftFace3dAnnoRes);

  const rightFace3dAnnoRes: AnnotationUpdate3D = copyAllAnnotationsFrom2dTo3d(faceId, rightFace);
  rightFace3d.updateAnnotations(rightFace3dAnnoRes);


  // add planes to scene manager (for now, hady will do later)
  addFace(leftFace3d);
  addFace(rightFace3d);
  deleteFace(faceId); // does the render deletion

  add2dFaceToPaperGraph(leftFace);
  add2dFaceToPaperGraph(rightFace);
  delete2dFaceToPaperGraph(faceId);


  // return the created faces back to the controller so that we can send these to backend
  return [leftFace, rightFace];
}


function copyAllAnnotationsFrom2dTo3d(ogFaceID: bigint, face2d: Face2D): AnnotationUpdate3D {
  const pointsAdded: Map<bigint, AnnotatedPoint3D> = new Map<bigint, AnnotatedPoint3D>();
  const pointsDeleted: bigint[] = [];
  const linesAdded: Map<bigint, AnnotatedLine> = new Map<bigint, AnnotatedLine>();
  const linesDeleted: bigint[] = [];


  // first we add all the points to 3d space
  for(const [annoPointId, annoPointObj2d] of face2d.getAnnotatedPointMap()) {
    const point3dVersion: Point3D | null = translate2dTo3d(annoPointObj2d.point, ogFaceID);
    if (point3dVersion == null) {
      throw new Error("issue converting from 2d to 3d:" + annoPointObj2d.point.x + ", " + annoPointObj2d.point.y);
    }

    const annoPointObj3d: AnnotatedPoint3D = {
      point: point3dVersion,
      edgeID: annoPointObj2d.edgeID
    }

    pointsAdded.set(annoPointId, annoPointObj3d);
  }


  let annotationResult: AnnotationUpdate3D = {
    pointsAdded: pointsAdded,
    pointsDeleted: pointsDeleted,
    linesAdded: linesAdded,
    linesDeleted: linesDeleted
  };

  return annotationResult;
}


function isPointOnLeftFace(vectorTowardsLeftFaceBasedOnOgPointIds: bigint[], pointIdOfOg: bigint, face2d: Face2D) {
  // create a vector pointing from origin that is our "basis"
  const targetPosition: Point2D = face2d.getPoint(pointIdOfOg);
  const projectedTarget: Point2D = face2d.projectToEdge(targetPosition, vectorTowardsLeftFaceBasedOnOgPointIds[0]);



  const point1InVector: Point2D = face2d.getPoint(vectorTowardsLeftFaceBasedOnOgPointIds[0]);
  const point2InVector: Point2D = face2d.getPoint(vectorTowardsLeftFaceBasedOnOgPointIds[1]);
  const originVector: Point2D = createPoint2D(
    point2InVector.x - point1InVector.x,
    point2InVector.y - point2InVector.y
  );

  // // create a target vector pointing to the point to add to the new faces
  const point1InTarget: Point2D = face2d.getPoint(vectorTowardsLeftFaceBasedOnOgPointIds[0]);
  const point2InTarget: Point2D = projectedTarget;
  const targetVector: Point2D = createPoint2D(
    point2InTarget.x - point1InTarget.x,
    point2InTarget.y - point1InTarget.y
  );


  // we can tell if our target point is on the same side if the projection vector and
  // basis vector are pointing in the same direction (it's either than, or oppisite directions
  // for the right face)
  return dotProduct(targetVector, originVector) > 0
}



function createSplitFace([minEdgePointId, firstEdgeId]: [bigint, bigint], [maxEdgePointId, secondEdgeId]: [bigint, bigint], face2D: Face2D, face3D: Face3D):
[[Face2D, Face3D, Map<bigint, bigint>, bigint], [Face2D, Face3D, Map<bigint, bigint>, bigint], bigint[]] {
  const listOfVertexForLeftFace: Point2D[] = [];
  const listOfVertexForLeftFace3d: Point3D[] = [];
  const mapOfOgPointIdsToNewPointIdsForLeftFace = new Map<bigint, bigint>();
  let theEdgeInTheLeftFaceThatComesFromFolding: bigint = -1n;

  // get the vertex start from 0 up into the top of our cut
  for(let i = 0n; i <= firstEdgeId; i++) {

    mapOfOgPointIdsToNewPointIdsForLeftFace.set(i, BigInt(listOfVertexForLeftFace.length));
    listOfVertexForLeftFace.push(face2D.getPoint(i));
    listOfVertexForLeftFace3d.push(face3D.getPoint(i));
    theEdgeInTheLeftFaceThatComesFromFolding = i;
  }

  // we've gotten to the first split, so include this point if we aren't at a vertex
  if (minEdgePointId !==  firstEdgeId) {
    mapOfOgPointIdsToNewPointIdsForLeftFace.set(minEdgePointId, BigInt(listOfVertexForLeftFace.length));
    listOfVertexForLeftFace.push(face2D.getPoint(minEdgePointId));
    listOfVertexForLeftFace3d.push(face3D.getPoint(minEdgePointId));
    theEdgeInTheLeftFaceThatComesFromFolding = minEdgePointId;
  }

  // we've gotten to the end split, so always include this point
  mapOfOgPointIdsToNewPointIdsForLeftFace.set(maxEdgePointId, BigInt(listOfVertexForLeftFace.length));
  listOfVertexForLeftFace.push(face2D.getPoint(maxEdgePointId));
  listOfVertexForLeftFace3d.push(face3D.getPoint(maxEdgePointId));

  // create a vector that is on the side of "leftFace", use this for telling which points
  // are on which face
  const vectorTowardsLeftFaceBasedOnOgPointIds: bigint[] = [secondEdgeId, (secondEdgeId + 1n) % face2D.N];


  // move on to the next vertex, since regardless of whether maxEdgeId = 2ndPointOnEdge, go to next
  for(let i = secondEdgeId + 1n; i < face2D.N; i+=1n) {
    mapOfOgPointIdsToNewPointIdsForLeftFace.set(i, BigInt(listOfVertexForLeftFace.length));
    listOfVertexForLeftFace.push(face2D.getPoint(i));
    listOfVertexForLeftFace3d.push(face3D.getPoint(i));
  }

  // create both 2d and 3d versions
  const leftFace = new Face2D(listOfVertexForLeftFace.slice());
  const leftFace3d = new Face3D(listOfVertexForLeftFace3d.slice(), face3D.getThickness(), face3D.getOffset(), face3D.getPrincipleNormal(), leftFace.ID);



  // now add the other face from the split
  const listOfVertexForRightFace: Point2D[] = [];
  const listOfVertexForRightFace3d: Point3D[] = [];
  const mapOfOgPointIdsToNewPointIdsForRightFace = new Map<bigint, bigint>();
  let theEdgeInTheRightFaceThatComesFromFolding: bigint = -1n;

  // we start and end on the new line, so create the top point of our new edge
  mapOfOgPointIdsToNewPointIdsForRightFace.set(minEdgePointId, BigInt(listOfVertexForRightFace.length));
  listOfVertexForRightFace.push(face2D.getPoint(minEdgePointId));
  listOfVertexForRightFace3d.push(face3D.getPoint(minEdgePointId));

  // add the og points, stopping at our new line
  for(let i = firstEdgeId + 1n; i <= secondEdgeId; i++) {
    mapOfOgPointIdsToNewPointIdsForRightFace.set(i, BigInt(listOfVertexForRightFace.length));
    listOfVertexForRightFace.push(face2D.getPoint(i));
    listOfVertexForRightFace3d.push(face3D.getPoint(i));
    theEdgeInTheRightFaceThatComesFromFolding = i;
  }

  // only if the end fold point isn't on the vertex do we add it
  // (since otherwise we've alreaded added it during the for loop)
  if (secondEdgeId !== maxEdgePointId) {
    mapOfOgPointIdsToNewPointIdsForRightFace.set(maxEdgePointId, BigInt(listOfVertexForRightFace.length));
    listOfVertexForRightFace.push(face2D.getPoint(maxEdgePointId));
    listOfVertexForRightFace3d.push(face3D.getPoint(maxEdgePointId));
    theEdgeInTheRightFaceThatComesFromFolding = maxEdgePointId;
  }

  // create both 2d and 3d versions
  const rightFace = new Face2D(listOfVertexForRightFace.slice());
  const rightFace3d = new Face3D(listOfVertexForRightFace3d.slice(), face3D.getThickness(), face3D.getOffset(), face3D.getPrincipleNormal(), rightFace.ID);

  if (rightFace.getAnnotatedPointMap().size  > 0) {
    throw new Error("SHOULD E");
  }

  return [[leftFace,  leftFace3d,  mapOfOgPointIdsToNewPointIdsForLeftFace,  theEdgeInTheLeftFaceThatComesFromFolding],
          [rightFace, rightFace3d, mapOfOgPointIdsToNewPointIdsForRightFace, theEdgeInTheRightFaceThatComesFromFolding],
          vectorTowardsLeftFaceBasedOnOgPointIds];
}




/**
 * Given two points, return the point objects based on which point has their edge come first
 * @param point1Id
 * @param point2Id
 * @param faceId
 */
function getPointEdgeOrder(point1Id: bigint, point2Id: bigint, faceId: bigint): [[bigint, bigint], [bigint, bigint]] {
  const face2d: Face2D | undefined = getFace2dFromId(faceId);
  if (face2d === undefined) {
    throw new Error("Face should be empty");
  }

  // both points are vertices, so just return those
  if (point1Id < face2d.N && point2Id < face2d.N) {
    const smallerId: bigint = intMin(point1Id, point2Id);
    const largerId: bigint = intMax(point1Id, point2Id);
    return [[smallerId, smallerId], [largerId, largerId]];
  }


  // only one point is vertex
  if (point1Id >= face2d.N && point2Id < face2d.N) {
    const annotatedPoint: AnnotatedPoint2D = face2d.getAnnotatedPoint(point1Id);
    if(annotatedPoint.edgeID === -1n) {
      throw new Error("point should be on edge");
    }

    if (annotatedPoint.edgeID < point2Id) {
      // point 1 comes first
      return [[point1Id, annotatedPoint.edgeID], [point2Id, point2Id]];
    }

    return [[point2Id, point2Id], [point1Id, annotatedPoint.edgeID]];
  }

  // only one point is vertex
  if (point2Id >= face2d.N && point1Id < face2d.N) {
    const annotatedPoint: AnnotatedPoint2D = face2d.getAnnotatedPoint(point2Id);
    if(annotatedPoint.edgeID === -1n) {
      throw new Error("point should be on edge");
    }

    if (annotatedPoint.edgeID < point1Id) {
      // point 2 comes first
      return [[point2Id, annotatedPoint.edgeID], [point1Id, point1Id]];
    }

    return [[point1Id, point1Id], [point2Id, annotatedPoint.edgeID]];
  }

  // both are anno points
  const annotatedPoint: AnnotatedPoint2D = face2d.getAnnotatedPoint(point1Id);
  if(annotatedPoint.edgeID === -1n) {
    throw new Error("point should be on edge");
  }

  const annotatedPoint2: AnnotatedPoint2D = face2d.getAnnotatedPoint(point2Id);
  if(annotatedPoint2.edgeID === -1n) {
    throw new Error("point should be on edge");
  }

  if (annotatedPoint.edgeID < annotatedPoint2.edgeID) {
    // point 1 comes first
    return [[point1Id, annotatedPoint.edgeID], [point2Id, annotatedPoint2.edgeID]];
  }
  // point 2 comes first
  return [[point2Id, annotatedPoint2.edgeID], [point1Id, annotatedPoint.edgeID]];
}


/**
 * @param lineId - the id of the line to check all other lines against
 * @param face2d - the face this occurs at
 * @returns a list of all the colinear lines that are close to lineId (exluding lineId)
 */
function getHangingPointsOnLine(lineId: bigint, face2d: Face2D) :  bigint[] {
  const retList: bigint[] = [];
  const annoPoints: Map<bigint, AnnotatedPoint2D> = face2d.getAnnotatedPointMap();
  // go thru each line, and remove if both ends of line segment are close to the cut edge
  // since that means the entire line is close enough
  for (const [id, pointObj] of annoPoints) {
    const listOfLinesPointIsOn: bigint[] = face2d.getIdsOfLinesPointIsIn(id);

    // check if you are a hanging point, and close to the fold line, if so, delete
    if (face2d.isPointOnCustomLine(pointObj.point, lineId) &&
        listOfLinesPointIsOn.length == 0) {
      retList.push(id);
    }
  }

  return retList;
}



/**
 * @param lineId - the id of the line to check all other lines against
 * @param face2d - the face this occurs at
 * @returns a list of all the colinear lines that are close to lineId (exluding lineId)
 */
function getColinearLine(lineId: bigint, face2d: Face2D) :  bigint[] {
  const retList: bigint[] = [];
  const annoLines: Map<bigint, AnnotatedLine> = face2d.getAnnotatedLinesMap();
  // go thru each line, and remove if both ends of line segment are close to the cut edge
  // since that means the entire line is close enough
  for (const [id, lineObj] of annoLines) {
    const startPointOnLine: Point2D = face2d.getPoint(lineObj.startPointID);
    const endPointOnLine: Point2D = face2d.getPoint(lineObj.endPointID);
    if (id != lineId &&
        face2d.isPointOnCustomLine(startPointOnLine, lineId) &&
        face2d.isPointOnCustomLine(endPointOnLine, lineId)) {

      retList.push(id);
    }
  }

  return retList;
}


function intMin(a: bigint, b: bigint): bigint {
  if (a < b) {
    return a;
  }
  return b;
}

function intMax(a: bigint, b: bigint): bigint {
  if (a > b) {
    return a;
  }
  return b;
}
