/**
 * @fileoverview This file handles the bookkeeping of the sole static
 * instance of PaperGraph which represents the paper model currently
 * being viewed/edited. The file provides folding algorithms with
 * manipulate and update the paper; these are the only point of entry
 * which a caller can use to fold the currently opened origami in
 * the abstract mathematical sense, not considering any 3D rendering.
 */

import { Face } from "three";
import { translate2dTo3d } from "../controller/Controller";
import { AnnotationUpdate2D, Face2D } from "../geometry/Face2D";
import { AnnotationUpdate3D, Face3D, FaceUpdate3D } from "../geometry/Face3D";
import { add, AnnotatedLine, AnnotatedPoint2D, AnnotatedPoint3D, createPoint2D, distance, dotProduct, Point, Point2D, Point3D, scalarMult } from "../geometry/Point";
import { addFace, deleteFace, getFace3DByID } from "../view/SceneManager";
import { add2dFaceToPaperGraph, createNewGraph, delete2dFaceToPaperGraph, EdgesAdjList, getAdjList, getFace2dFromId, print2dGraph, updateAdjListForSplitGraph } from "./PaperGraph";


const HOW_CLOSE_DO_EDGES_NEED_BE_DIRECTION_WISE_TO_MERGE = -0.97;
const DISTANCE_TO_ALLOW_MERGING_POINTS = 0.05;

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



export function mergeFaces(faceId1: bigint, faceId2: bigint) {
  let face1Obj2d: Face2D | undefined = getFace2dFromId(faceId1);
  if (face1Obj2d === undefined) {
    return false;
  }


  let face2Obj2d: Face2D | undefined = getFace2dFromId(faceId2);
  if (face2Obj2d === undefined) {
    return false;
  }

  // create base face
  const [mergedFace, mergedFace3d, leftFacePointIdsToNewIds, rightFacePointIdsToNewIds] = createMergedFaceSkeleton(faceId1, faceId2);
  console.log("SKELE", mergedFace);
  const [face1EdgeMerge, face2EdgeMerge] = getEdgesThatAreApartOfMerging(face1Obj2d, face2Obj2d);
  // create the annotation content for the face 2d
  // now we add the annotation points for the left face
  const listOfAnnoPointsForOgFace1: Map<bigint, AnnotatedPoint2D> = face1Obj2d.getAnnotatedPointMap();
  // todo merge same points
  for (const [annoPointId, annoPointObj] of listOfAnnoPointsForOgFace1) {
    let updateEdgeId: bigint | undefined = leftFacePointIdsToNewIds.get(annoPointObj.edgeID);
    if (updateEdgeId === undefined) {
      updateEdgeId = -1n; // only case where we get undefined is if we aren't connected to an edge
    }

    // add to face2d
    const resultFromAddingPoint: AnnotationUpdate2D = mergedFace.addAnnotatedPoint(annoPointObj.point, updateEdgeId);
    // update map with new anno point id

    if (resultFromAddingPoint.pointsAdded.size !== 1) {
      throw new Error("should have added 1 point for 1 new point");
    }

    for(const newPointId of resultFromAddingPoint.pointsAdded.keys()) {
      leftFacePointIdsToNewIds.set(annoPointId, newPointId);
    }
  }

  // now we add the annotation points for the right face
  const listOfAnnoPointsForOgFace2: Map<bigint, AnnotatedPoint2D> = face2Obj2d.getAnnotatedPointMap();
  for (const [annoPointId, annoPointObj] of listOfAnnoPointsForOgFace2) {
    let updateEdgeId: bigint | undefined = rightFacePointIdsToNewIds.get(annoPointObj.edgeID);
    if (updateEdgeId === undefined) {
      updateEdgeId = -1n; // only case where we get undefined is if we aren't connected to an edge
    }


    // if the original edge im on is the merging one, we need to check
    // that we should "merge points"
    console.log("when merging points, are they on an edge", annoPointObj.edgeID, face2EdgeMerge);
    if (face2EdgeMerge === annoPointObj.edgeID && closestPoint(mergedFace, annoPointObj.point) !== undefined) {
      // if true, we will use this point for our merging
      const pointId: bigint | undefined = closestPoint(mergedFace, annoPointObj.point);
      // this if statement is just a TS formality
      if (pointId !== undefined) {
        // set another pointer from this newly "created" point
        rightFacePointIdsToNewIds.set(annoPointId, pointId);
      } else {
        throw new Error("Should never happen");
      }
    } else {
      // we need to create a new point
      // add to face2d
      const resultFromAddingPoint: AnnotationUpdate2D = mergedFace.addAnnotatedPoint(annoPointObj.point, updateEdgeId);
      // update map with new anno point id

      if (resultFromAddingPoint.pointsAdded.size !== 1) {
        throw new Error("should have added 1 point for 1 new point");
      }

      for(const newPointId of resultFromAddingPoint.pointsAdded.keys()) {
        rightFacePointIdsToNewIds.set(annoPointId, newPointId);
      }
      }
  }


  // now we add the annotation lines for the left face
  const listOfAnnoLinesForOgFace1: Map<bigint, AnnotatedLine> = face1Obj2d.getAnnotatedLinesMap();
  for (const [lineId, lineObj] of listOfAnnoLinesForOgFace1) {
    const updatedPointId1 = leftFacePointIdsToNewIds.get(lineObj.startPointID);
    const updatedPointId2 = leftFacePointIdsToNewIds.get(lineObj.endPointID);

    if (updatedPointId1 === undefined || updatedPointId2 === undefined) {
      throw new Error();
    }

    mergedFace.addAnnotatedLine(updatedPointId1, updatedPointId2);
  }


  // now we add the annotation lines for the right face
  const listOfAnnoLinesForOgFace2: Map<bigint, AnnotatedLine> = face2Obj2d.getAnnotatedLinesMap();
  for (const [lineId, lineObj] of listOfAnnoLinesForOgFace2) {
    const updatedPointId1 = rightFacePointIdsToNewIds.get(lineObj.startPointID);
    const updatedPointId2 = rightFacePointIdsToNewIds.get(lineObj.endPointID);

    if (updatedPointId1 === undefined || updatedPointId2 === undefined) {
      throw new Error();
    }

    mergedFace.addAnnotatedLine(updatedPointId1, updatedPointId2);
  }


  // now update the 3d face from the 2d version
  // do both left and right faces into one new 3d object
  const updated3dAnnotationsLeftFace: AnnotationUpdate3D = copyAllAnnotationsFrom2dTo3d(faceId1, face1Obj2d);
  mergedFace3d.updateAnnotations(updated3dAnnotationsLeftFace);

  const updated3dAnnotationsRightFace: AnnotationUpdate3D = copyAllAnnotationsFrom2dTo3d(faceId2, face2Obj2d);
  mergedFace3d.updateAnnotations(updated3dAnnotationsRightFace);


  // add planes to scene manager (for now, hady will do later)
  addFace(mergedFace3d);
  deleteFace(faceId1); // does the render deletion
  deleteFace(faceId2); // does the render deletion

  add2dFaceToPaperGraph(mergedFace);
  delete2dFaceToPaperGraph(faceId1);
  delete2dFaceToPaperGraph(faceId2);

  // return the created faces back to the controller so that we can send these to backend
  [mergedFace, mergedFace3d];
}


function closestPoint(face: Face2D, point: Point2D) {
  for(const [pointId, pointObj] of face.getAnnotatedPointMap()) {
    if (distance(pointObj.point, point) <= DISTANCE_TO_ALLOW_MERGING_POINTS) {
      return pointId;
    }
  }

  return undefined
}

function getEdgesThatAreApartOfMerging(face1Obj2d: Face2D, face2Obj2d: Face2D) {
  const adjList: Map<bigint, EdgesAdjList[]> = getAdjList();

  const listOfAllNeighbors = adjList.get(face1Obj2d.ID);
  if (listOfAllNeighbors === undefined) {
    throw new Error();
  }

  for(let i = 0; i < listOfAllNeighbors.length; i++) {
    // we've found the match between faces
    if (listOfAllNeighbors[i].idOfOtherFace === face2Obj2d.ID) {
      return [listOfAllNeighbors[i].edgeIdOfMyFace, listOfAllNeighbors[i].edgeIdOfOtherFace];
    }
  }

  throw new Error();
}

function createMergedFaceSkeleton(face1ObjId: bigint, face2ObjId: bigint) :
  [Face2D, Face3D, Map<bigint, bigint>, Map<bigint, bigint>] {
  const face1Obj2d: Face2D | undefined = getFace2dFromId(face1ObjId);
  if (face1Obj2d === undefined) {
    throw new Error();
  }
  const face2Obj2d: Face2D | undefined = getFace2dFromId(face2ObjId);
  if (face2Obj2d === undefined) {
    throw new Error();
  }

  const face1Obj3d: Face3D | undefined = getFace3DByID(face1ObjId);
  if (face1Obj3d === undefined) {
    throw new Error();
  }
  const face2Obj3d: Face3D | undefined = getFace3DByID(face2ObjId);
  if (face2Obj3d === undefined) {
    throw new Error();
  }


  const listOfVertexForMergedFace2d: Point2D[] = [];
  const listOfVertexForMergedFace3d: Point3D[] = [];
  const leftFacePointIdsToNewIds = new Map<bigint, bigint>();
  const rightFacePointIdsToNewIds = new Map<bigint, bigint>();


  const [face1EdgeMerge, face2EdgeMerge] = getEdgesThatAreApartOfMerging(face1Obj2d, face2Obj2d);
  //mapOfOgPointIdsToNewPointIdsForLeftFace.set(i, BigInt(listOfVertexForLeftFace.length));
  // get all values around the cut for face 1
  // get everything but the actual merge edge

  // we first check if we need to add the fold point
  // this only occurs if the vectors are not parallel in oppisite directions
  const startEdgePoint: Point2D = face1Obj2d.getPoint((face1EdgeMerge + 1n) % face1Obj2d.N);
  const vertexBeforeFace2StartOfFoldEdge = face2Obj2d.getPoint((face2Obj2d.N - 1n + face2EdgeMerge) % face2Obj2d.N);
  const vertexForFace1AfterStartEdgePoint = face1Obj2d.getPoint((face1EdgeMerge + 2n) % face1Obj2d.N);


  const startEdgebasis1 = createPoint2D(
    vertexBeforeFace2StartOfFoldEdge.x - startEdgePoint.x,
    vertexBeforeFace2StartOfFoldEdge.y - startEdgePoint.y,
  );
  const startEdgebasis2 = createPoint2D(
    vertexForFace1AfterStartEdgePoint.x - startEdgePoint.x,
    vertexForFace1AfterStartEdgePoint.y - startEdgePoint.y,
  );

  // see if the direction of each vectors are different, if they are, we need to add the edge point
  const cosSimilarity = 1.0 * dotProduct(startEdgebasis1, startEdgebasis2) /
    (distance(startEdgebasis1, createPoint2D(0, 0)) * distance(startEdgebasis2, createPoint2D(0, 0)));

  console.log("TEST1", cosSimilarity);

  if (cosSimilarity > HOW_CLOSE_DO_EDGES_NEED_BE_DIRECTION_WISE_TO_MERGE) {
    // they aren't in the oppisite direction, so we need to add the point
    const index = (face1EdgeMerge + 1n) % face1Obj2d.N;
    leftFacePointIdsToNewIds.set(index, BigInt(listOfVertexForMergedFace2d.length));
    listOfVertexForMergedFace2d.push(face1Obj2d.getPoint(index));
    listOfVertexForMergedFace3d.push(face1Obj3d.getPoint(index));
  }


  for(let i = 0n; i < face1Obj2d.N - 2n; i++) {
    // go around circle, starting and end of face merge
    // we do + 2, since we NEVER include the vertex of the merged edge,
    const index = (i + face1EdgeMerge + 2n) % face1Obj2d.N;
    leftFacePointIdsToNewIds.set(index, BigInt(listOfVertexForMergedFace2d.length));
    listOfVertexForMergedFace2d.push(face1Obj2d.getPoint(index));
    listOfVertexForMergedFace3d.push(face1Obj3d.getPoint(index));
  }

  // now we need to check if we should include the other edge point (same reasoning as before)
  const endEdgePoint: Point2D = face2Obj2d.getPoint((face2EdgeMerge + 1n) % face2Obj2d.N);
  const vertexBeforeFace1EndOfFoldEdge = face1Obj2d.getPoint((face1Obj2d.N - 1n + face1EdgeMerge) % face1Obj2d.N);
  const vertexForFace2AfterEndEdgePoint = face2Obj2d.getPoint((face2EdgeMerge + 2n) % face2Obj2d.N);

  const endEdgebasis1 = createPoint2D(
    vertexBeforeFace1EndOfFoldEdge.x - endEdgePoint.x,
    vertexBeforeFace1EndOfFoldEdge.y - endEdgePoint.y,
  );
  const endEdgebasis2 = createPoint2D(
    vertexForFace2AfterEndEdgePoint.x - endEdgePoint.x,
    vertexForFace2AfterEndEdgePoint.y - endEdgePoint.y,
  );

  // see if the direction of each vectors are different, if they are, we need to add the edge point
  const cosSimilarityEnd = 1.0 * dotProduct(endEdgebasis1, endEdgebasis2) /
    (distance(endEdgebasis1, createPoint2D(0, 0)) * distance(endEdgebasis2, createPoint2D(0, 0)));

  if (cosSimilarityEnd > HOW_CLOSE_DO_EDGES_NEED_BE_DIRECTION_WISE_TO_MERGE) {
    // they aren't in the oppisite direction, so we need to add the point
    const index = (face2EdgeMerge + 1n) % face2Obj2d.N;
    rightFacePointIdsToNewIds.set(index, BigInt(listOfVertexForMergedFace2d.length));
    listOfVertexForMergedFace2d.push(face2Obj2d.getPoint(index));
    listOfVertexForMergedFace3d.push(face2Obj3d.getPoint(index));
  }


  // get all values around the cut for face 2
  // turns out to be the same process, end of 1 is start of 2 in a circle
  for(let i = 0n; i < face2Obj2d.N - 2n; i++) {
    // go around circle, starting and end of face merge
    const index = (i + face2EdgeMerge + 2n) % face2Obj2d.N;
    rightFacePointIdsToNewIds.set(index, BigInt(listOfVertexForMergedFace2d.length));
    listOfVertexForMergedFace2d.push(face2Obj2d.getPoint(index));
    listOfVertexForMergedFace3d.push(face2Obj3d.getPoint(index));
  }

  // create both 2d and 3d versions
  const mergedFace = new Face2D(listOfVertexForMergedFace2d.slice());
  const mergedFace3d = new Face3D(listOfVertexForMergedFace3d.slice(), face1Obj3d.getThickness(), face1Obj3d.getOffset(), face1Obj3d.getPrincipleNormal(), mergedFace.ID);


  return [mergedFace, mergedFace3d, leftFacePointIdsToNewIds, rightFacePointIdsToNewIds];
}



export function graphCreateNewFoldSplit(point1Id: bigint, point2Id: bigint, faceId: bigint, angle: bigint, pointThatShouldKeepFaceStationary: Point2D): [Face2D,Face2D,bigint] | false {
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



  // now that we got rid of the annoying stuff in our split line, we can now create a line that intersects
  // the content
  // gets list of stuff that intersects
  // the points added need to be put to both, and the lines added shouldn't be included since that's
  // the edge line
  const addedLineUpdates: AnnotationUpdate2D = face2d.addAnnotatedLine(point1Id, point2Id);


  // now we delete the colinear lines and points that were potentially create by intersecting
  // the fold edge
  const dangerousLineID: bigint = face2d.addRawAnnotatedLine(point1Id, point2Id)

  // first we need to delete all the colinear lines between our "edge"
  const listOfLinesToDelete = getColinearLine(dangerousLineID, face2d);
  listOfLinesToDelete.forEach(lineId => face2d.delAnnotatedLine(lineId));

  const listOfHangingPointsToDelete = getHangingPointsOnLine(dangerousLineID, face2d);
  listOfHangingPointsToDelete.forEach(pointId => face2d.delAnnotatedPoint(pointId));
  face2d.delAnnotatedLine(dangerousLineID);

  // add the points of the fold line too
  // addedLineUpdates.pointsAdded.set(point1Id, face2d.getAnnotatedPoint(point1Id));
  // addedLineUpdates.pointsAdded.set(point2Id, face2d.getAnnotatedPoint(point2Id));

  if (addedLineUpdates.status !== "NORMAL") {
    return false;
  }

  // now we create the two faces, so we can add the pt/lines to it
  const [[leftFace, leftFace3d, leftFacePointIdFromOG, foldEdgeIdLeft],
         [rightFace, rightFace3d, rightFacePointIdFromOG, foldEdgeIdRight],
         vectorTowardsLeftFaceBasedOnOgPointIds, pointAtEndOfFoldLine] =

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

  // figure out which cut plane should be stationary
  let whichFaceIsStationary = rightFace.ID;
  if (isPointOnLeftFace(vectorTowardsLeftFaceBasedOnOgPointIds, pointAtEndOfFoldLine, pointThatShouldKeepFaceStationary, face2d)) {
    whichFaceIsStationary = leftFace.ID;
  }


  // now add all the points on only one of the faces
  const listOfDoubleOgPoints: bigint[] = Array.from(addedLineUpdates.pointsAdded.keys());
  for(const [pointIdOfOg, pointObjOfOg] of face2d.getAnnotatedPointMap()) {
    // only add point if we didn't do it before and it's NOT AN EDGE POINT
    if (!listOfDoubleOgPoints.includes(pointIdOfOg) && pointIdOfOg !== point1Id && pointIdOfOg !== point2Id) {
      if (isPointOnLeftFace(vectorTowardsLeftFaceBasedOnOgPointIds, pointAtEndOfFoldLine, face2d.getPoint(pointIdOfOg), face2d)) {
        // add to left face
        console.log("adding left", pointIdOfOg);
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
        console.log("adding right", pointIdOfOg);
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
    if(true || !listOfLinesOnFoldEdge.includes(lineId)) {
      // these lines should only be in either left face or right face, so if I check
      // whether the points exists in my map for both, then i can add
      // only one if statement should occur
      const check1 = leftFacePointIdFromOG.get(lineIdObj.startPointID);
      const check2 = leftFacePointIdFromOG.get(lineIdObj.endPointID);

      const check3 = rightFacePointIdFromOG.get(lineIdObj.startPointID);
      const check4 = rightFacePointIdFromOG.get(lineIdObj.endPointID);
      // we do the checks here since either 1/2 or 3/4 will miss them
      // since these lines should be on one and only one face
      if(check1 !== undefined && check2 !== undefined && leftFacePoints.includes(check1) &&
         leftFacePoints.includes(check2)) {

        // left face has both points, so make a new line
        const startPointForNewFace: bigint | undefined = leftFacePointIdFromOG.get(lineIdObj.startPointID);
        const endPointForNewFace: bigint | undefined = leftFacePointIdFromOG.get(lineIdObj.endPointID);
        if (startPointForNewFace === undefined || endPointForNewFace === undefined) {
          throw new Error("create points map for left face missed something");
        }
        leftFace.addAnnotatedLine(startPointForNewFace, endPointForNewFace);
        console.log("ADDED TO LEFT LINES");
      }
      else if(check3 !== undefined && check4 !== undefined && rightFacePoints.includes(check3) &&
         rightFacePoints.includes(check4)) {

        // right face has both points, so make a new line
        const startPointForNewFace: bigint | undefined = rightFacePointIdFromOG.get(lineIdObj.startPointID);
        const endPointForNewFace: bigint | undefined = rightFacePointIdFromOG.get(lineIdObj.endPointID);
        if (startPointForNewFace === undefined || endPointForNewFace === undefined) {
          throw new Error("create points map for right face missed something");
        }
        rightFace.addAnnotatedLine(startPointForNewFace, endPointForNewFace);
        console.log("ADDED TO RIGHT LINES");
      } else {
        console.error("happen");
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
  return [leftFace, rightFace, whichFaceIsStationary];
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


function isPointOnLeftFace(vectorTowardsLeftFaceBasedOnOgPointIds: Point2D, pointOfStartVector: Point2D, targetPoint: Point2D, face2d: Face2D) {
  // create our target vector centered at origin
  const targetPosition: Point2D = createPoint2D(
    targetPoint.x - pointOfStartVector.x,
    targetPoint.y - pointOfStartVector.y
  );

  const projectedTarget: Point2D = projectPointToCustomVectorCenteredAtOrigin(
    vectorTowardsLeftFaceBasedOnOgPointIds,
    targetPosition
  );

  // we can tell if our target point is on the same side if the projection vector and
  // basis vector are pointing in the same direction (it's either than, or oppisite directions
  // for the right face)
  return dotProduct(projectedTarget, vectorTowardsLeftFaceBasedOnOgPointIds) > 0
}


function projectPointToCustomVectorCenteredAtOrigin(vector: Point2D, target: Point2D) : Point2D {
  return scalarMult(vector, (1.0 * dotProduct(target, vector))/(dotProduct(vector, vector)))
}


function createSplitFace([minEdgePointId, firstEdgeId]: [bigint, bigint], [maxEdgePointId, secondEdgeId]: [bigint, bigint], face2D: Face2D, face3D: Face3D):
[[Face2D, Face3D, Map<bigint, bigint>, bigint], [Face2D, Face3D, Map<bigint, bigint>, bigint], Point2D, Point2D] {
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
    theEdgeInTheLeftFaceThatComesFromFolding = BigInt(listOfVertexForLeftFace.length);
    mapOfOgPointIdsToNewPointIdsForLeftFace.set(minEdgePointId, BigInt(listOfVertexForLeftFace.length));
    listOfVertexForLeftFace.push(face2D.getPoint(minEdgePointId));
    listOfVertexForLeftFace3d.push(face3D.getPoint(minEdgePointId));
  }

  // we've gotten to the end split, so always include this point
  mapOfOgPointIdsToNewPointIdsForLeftFace.set(maxEdgePointId, BigInt(listOfVertexForLeftFace.length));
  listOfVertexForLeftFace.push(face2D.getPoint(maxEdgePointId));
  listOfVertexForLeftFace3d.push(face3D.getPoint(maxEdgePointId));

  // create a vector that is on the side of "leftFace", use this for telling which points
  // are on which face

  // one past the fold edge
  const createDirectionVectorPointEnd: Point2D = face2D.getPoint((secondEdgeId + 1n) % face2D.N);
  let createDirectionVectorPointStart: Point2D = createPoint2D(0, 0); // temp value
  if (maxEdgePointId < face2D.ID) {
    // turns out the end of the fold edge is on a vertex
    createDirectionVectorPointStart = face2D.getPoint(secondEdgeId % face2D.N);
  } else{
    // turns out the end of the fold edge is an annopoint
    createDirectionVectorPointStart = face2D.getAnnotatedPoint(maxEdgePointId).point;
  }

  // create the vertex that will check for direction, it is centered at origin
  const vectorTowardsLeftFaceBasedOnOgPointIds: Point2D = createPoint2D(
    createDirectionVectorPointEnd.x - createDirectionVectorPointStart.x,
    createDirectionVectorPointEnd.y - createDirectionVectorPointStart.y,
  );



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
    theEdgeInTheRightFaceThatComesFromFolding = BigInt(listOfVertexForRightFace.length);
    mapOfOgPointIdsToNewPointIdsForRightFace.set(maxEdgePointId, BigInt(listOfVertexForRightFace.length));
    listOfVertexForRightFace.push(face2D.getPoint(maxEdgePointId));
    listOfVertexForRightFace3d.push(face3D.getPoint(maxEdgePointId));
  }

  // create both 2d and 3d versions
  const rightFace = new Face2D(listOfVertexForRightFace.slice());
  const rightFace3d = new Face3D(listOfVertexForRightFace3d.slice(), face3D.getThickness(), face3D.getOffset(), face3D.getPrincipleNormal(), rightFace.ID);

  if (rightFace.getAnnotatedPointMap().size  > 0) {
    throw new Error("SHOULD E");
  }

  return [[leftFace,  leftFace3d,  mapOfOgPointIdsToNewPointIdsForLeftFace,  theEdgeInTheLeftFaceThatComesFromFolding],
          [rightFace, rightFace3d, mapOfOgPointIdsToNewPointIdsForRightFace, theEdgeInTheRightFaceThatComesFromFolding],
          vectorTowardsLeftFaceBasedOnOgPointIds, createDirectionVectorPointStart];
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
    } else {
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
