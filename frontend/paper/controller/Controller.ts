/**
 * @fileoverview This file implements the layer of connection between the
 * 3D world edited by UI and managed by SceneManager, and the 2D world
 * managed by PaperManager. The controller is further responsible for
 * making appropriate calls to backend through the RequestHandler.
 */

import * as THREE from 'three';
import * as SceneManager from "../view/SceneManager.js";
import { AnnotationUpdate3D, Face3D } from "../geometry/Face3D.js";
import { AnnotationUpdate2D, Face2D } from '../geometry/Face2D.js'; // export Face 2d

import { createPoint2D, createPoint3D, Point3D, Point2D, AnnotatedLine, AnnotatedPoint3D, Point, processTransationFrom3dTo2d, AnnotatedPoint2D, distance, dotProduct } from "../geometry/Point.js";
import {addRotationListToDB, addSplitFacesToDB, addUpdatedAnnoationToDB, getStepFromDB} from "./RequestHandler.js";
import {AddNewEdgeToDisjointSet, addValueToAdjList, BFS, EdgesAdjList, EdgesAdjListMerging, getAdjList, getAllFaceIds, getConnectionInAdjList, getDisjointSetEdge, getDisjointSetEdgeAndDelete, getFace2dFromId, isConnectionInAdjList, print2dGraph, printAdjList, ReplaceExistingConnectionsBasedOnFirstWithNewConnections, ReplaceExistingConnectionWithNewConnections, updateAdjListForMergeGraph, updateRelativePositionBetweenFacesIndependentOfRelativeChange} from "../model/PaperGraph.js"
import { getFace3DByID, incrementStepID, print3dGraph, animateFold, deleteFace, addFace, animateOffset } from '../view/SceneManager.js';

import { EditorStatus, EditorStatusType } from '../view/EditorMessage.js';
import { graphCreateNewFoldSplit, mergeFaces, ProblemEdgeInfo, ProblemEdgeInfoMerge } from '../model/PaperManager.js';
import { faceMutatingFold, getOverlappingFaces } from '../model/PaperStack.js';
import { off } from 'process';
import { basisToWorld, basisToWorld2D, getPlaneBasis, getPlaneBasis2D, PlaneBasis2D, PlaneBasis3D, projectToPlane, projectToPlane2D } from '../geometry/geometry.js';


const USE_EXISTING_POINT_IN_GREEN_LINE = 0.5;



/**
 * Achieves a part of a fold action by actually rotating the planes
 * assumes the planes are correctly split up, and connected via an edge
 * @param faceId1 - the first face that rotates
 * @param faceId2  - the second face that roates
 * @param stationaryFace - the face that is stationary/doesn't move during rotation
 * @param relativeChange - the relative rotation in degrees of the moving plane, where positive is in the prinicpal
 *                         normal vector direction for faces
 * @returns true/ or an error message
 */
async function updateAnExistingFold(faceId1: bigint, faceId2: bigint, stationaryFace:bigint, relativeChange: bigint) {
  if (faceId1 === faceId2) {
    return "Faces are the same";
  }

  // Animate the fold.
  const edgeIDs = updateRelativePositionBetweenFacesIndependentOfRelativeChange(
    faceId1, faceId2, relativeChange
  );
  if (stationaryFace === faceId1) {
    animateFold(stationaryFace, edgeIDs[0], Number(relativeChange), faceId2);
  } else if (stationaryFace === faceId2) {
    animateFold(stationaryFace, edgeIDs[1], Number(relativeChange), faceId1);
  }





  // backend needs a simple update angle step




  // print2dGraph();
  // print3dGraph();
  // printAdjList();

  incrementStepID();
  return true;
}


// find if there is a face that in my facesToConnectWith set that is connected to target face in adj  list
function getFaceIdThatTouchesTargetFace(targetFaceId: bigint, facesToConnectWith: Set<bigint>) {
  const listOfTargetConnections = getAdjList().get(targetFaceId);
  const listOfTargetConnectionsIds: bigint[] = [];

  for(const item of listOfTargetConnections) {
    listOfTargetConnectionsIds.push(item.idOfOtherFace);
  }


  if (listOfTargetConnections === undefined) {
    return undefined;
  }

  for(const potentialIdConnection of facesToConnectWith) {
    if (listOfTargetConnectionsIds.includes(potentialIdConnection)) {
      return potentialIdConnection;
    }
  }

  return undefined;
}


/**
 * takes a target point on the place and makes a vector that points in the direction from the edge
 * to the target point where the angle between the edge and the vector is 90 degrees
 * @param stationaryFaceId - id of face you want
 * @param edgeIdOfST - edge to bank off of
 * @param targetPoint - the point to make a vector with target
 * @returns
 */
function getOriginVectorPointingInDirectionOfTargetFromCutEdge(stationaryFaceId: bigint, edgeIdOfST: bigint, targetPoint: Point3D) {
  const statFaceObj = getFace3DByID(stationaryFaceId);
  if (statFaceObj === undefined) {
    throw new Error("no face");
  }
  const targetPointProjectedOnStatFace = statFaceObj.projectToFace(targetPoint);
  const projectedPtToCutEdge = statFaceObj.projectToEdge(targetPointProjectedOnStatFace, edgeIdOfST);


  return createPoint3D(
    targetPointProjectedOnStatFace.x - projectedPtToCutEdge.x,
    targetPointProjectedOnStatFace.y - projectedPtToCutEdge.y,
    targetPointProjectedOnStatFace.z - projectedPtToCutEdge.z
  );
}





/**
 * Takes two faces and updates the angle between them for all edges linked to the provided one
 * may merge if needed
 * @param faceId1 - face1 of edge
 * @param faceId2 - face2 of edge
 * @param stationaryFace - id of face1/face2: whichevery doesn't move
 * @param relativeChange - the angle in degrees between them. Positive puts the normals closer together
 * @returns
 */
export async function updateExistingMultiFold(faceId1: bigint, faceId2: bigint, stationaryFace:bigint, relativeChange: bigint) {
  if (faceId1 === faceId2) {
    return "Faces are the same";
  }

  const getAllEdgesThatAreApartOfTheFace1Face2Connection = getDisjointSetEdge(faceId1, faceId2);



  let startMovingFace: bigint = -1n;
  let startStationaryFace: bigint = -1n;

  if (stationaryFace === faceId1) {
    startStationaryFace = faceId1;
    startMovingFace = faceId2;
  } else {
    startStationaryFace = faceId2;
    startMovingFace = faceId1;
  }

  // get moving faces for animation
  const allMovingFaces: Set<bigint> = BFS([startMovingFace], getAllEdgesThatAreApartOfTheFace1Face2Connection);
  const allStatFaces: Set<bigint> = BFS([startStationaryFace], getAllEdgesThatAreApartOfTheFace1Face2Connection);

  // idea is if we have an isolated face
  // we do bfs from isolated face, matching with oppisite of cross edge type
  for (const faceId of getAllFaceIds()) {
    // if we've found a isolated face, need to add it
    if (!allMovingFaces.has(faceId) && !allStatFaces.has(faceId)) {
      // find connection from either set that connects existing face to it
      const faceIdFromSetTouchesFace = getFaceIdThatTouchesTargetFace(faceId, allMovingFaces);
      if(faceIdFromSetTouchesFace !== undefined) {
        // meaning other side was a moving face, so I am stationary
        // and any other independed faces attached to me are as well
        const allIdpFaces: Set<bigint> = BFS([faceId], getAllEdgesThatAreApartOfTheFace1Face2Connection);
        allIdpFaces.forEach(item => allStatFaces.add(item));
      } else if (faceIdFromSetTouchesFace !== undefined) {
        // meaning other side was a stat face, so I am moving
        // and any other independed faces attached to me are as well
        const allIdpFaces: Set<bigint> = BFS([faceId], getAllEdgesThatAreApartOfTheFace1Face2Connection);
        allMovingFaces.forEach(item => allStatFaces.add(item));
      }
    }
  }



  // safety check that makes sure all faces were caught
  for(const faceId of getAllFaceIds()) {
    if (!allMovingFaces.has(faceId) && !allStatFaces.has(faceId)) {
      console.error("missed a face");
    }
  }

  // get edge id of rotation for animation
  let edgeIdOfRot: bigint = -1n;

  const edgeIDsStart = updateRelativePositionBetweenFacesIndependentOfRelativeChange(
    faceId1, faceId2, -relativeChange
  );

  if (stationaryFace === faceId1) {
    edgeIdOfRot = edgeIDsStart[0];
  } else if (stationaryFace === faceId2) {
    edgeIdOfRot = edgeIDsStart[1];
  } else {
    throw new Error("internal issue");
  }



  // update face value
  for(const edge of getAllEdgesThatAreApartOfTheFace1Face2Connection) {
    if ((edge.face1Id == faceId1 && edge.face2Id == faceId2) ||
        (edge.face1Id == faceId2 && edge.face2Id == faceId1)) {
          continue;  // don't want to update the clicked edge id twice. already did this above
    }


    updateRelativePositionBetweenFacesIndependentOfRelativeChange(
      edge.face1Id, edge.face2Id, relativeChange
    );
  }

  animateFold(stationaryFace, edgeIdOfRot, Number(relativeChange), ...allMovingFaces);


  await sleep(5000);

  // now we see what the new value is
  const newAngleBetweenDSEdge: bigint = getConnectionInAdjList(faceId1, faceId2).angleBetweenThem;
  console.log("new angle: " + newAngleBetweenDSEdge);
  if (newAngleBetweenDSEdge === 180n) {
    // we need to do our merge
    console.log("begin merge");
    const result = await mergeMultiFaces(faceId1, faceId2, stationaryFace);
    console.log(result);
    print2dGraph();

  } else {
    const listOfAllMovingFacesInDsSet: {moveFace:bigint, statFace:bigint}[] = []
    for(const movingFace of allMovingFaces) {
      const isInMyEdge = getPairingInsideDSEdgeSet(movingFace, getAllEdgesThatAreApartOfTheFace1Face2Connection);
      if (isInMyEdge !== undefined) {
        listOfAllMovingFacesInDsSet.push(isInMyEdge);
      }
    }

    // it's just a regular no merge update, update backend via /rotate
    await addRotationListToDB(listOfAllMovingFacesInDsSet);
  }

  return true;
}

/**
 * mimics java classes Thread.sleep(ms) since TS uses event based design
 * to use this method, do
 * await sleep(miliseconds);
 * @param ms
 * @returns
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * goal is to return the connection to faceIdTarget in provided set. undefined if no connection found
 * @param faceIdTarget
 * @param getAllEdgesThatAreApartOfTheFace1Face2Connection
 */
function getPairingInsideDSEdgeSet(faceIdTarget: bigint, getAllEdgesThatAreApartOfTheFace1Face2Connection: Set<{
  face1Id: bigint;
  face2Id: bigint;
}>) {

  for(const edge of getAllEdgesThatAreApartOfTheFace1Face2Connection) {
    // idea is i give the moving face, so return it first
    if (edge.face1Id === faceIdTarget) {
      return {moveFace:edge.face1Id, statFace:edge.face2Id};
    }
    if (edge.face2Id === faceIdTarget) {
      return {moveFace:edge.face2Id, statFace:edge.face1Id};
    }
  }

  return undefined;
}


/**
 * takes two faces, and merges the DS set that contain the edges
 * @param faceId1
 * @param faceId2
 */
async function mergeMultiFaces(faceId1: bigint, faceId2: bigint, stationaryFaceId: bigint) {
  // get all edges that should be merged together
  const dsEdges: {face1Id: bigint,face2Id: bigint}[] = Array.from(getDisjointSetEdge(faceId1, faceId2));

  // use this to update ds edges that should be merged (problem edges)
  const listOfDsEdgesThatNeedToBeMerged: {face1: bigint, face2: bigint}[] = [];

  // takes dsmappping and breaks it up into 2 kv pairs
  const mapOfChildFacesToMergedFaces: Map<bigint, bigint> = new Map<bigint, bigint>();

  // list of all the a1 b1, a2 b2 connection (ie problem edges) but NEVER b1 a1 in the same list
  const listOfAllChildEdges: EdgesAdjListMerging[] = [];

  // renderer information
  const allFacesCreated: bigint[] = [];
  const allFacesDeleted: bigint[] = [];
  console.log("GOT HERE");
  // go thru all children faces and merge them, update the
  // adj list,
  for (let i = 0; dsEdges.length; i++) {
    // actually create the new face and partially update
    // the adj list
    console.log("GOT HERE 2");
    const currentEdge = dsEdges[i];
    if (currentEdge == undefined) { // this is a hot fix, find out why ds edge has undefined value in it
      break;
    }
    const resultForOneFace = await createANewFoldByMerging(currentEdge.face1Id, currentEdge.face2Id);
    if (typeof(resultForOneFace) === "string") {
      throw new Error(resultForOneFace);
    }

    // udpate fields needed for after face creation
    // update fields for adj list for problem edge
    mapOfChildFacesToMergedFaces.set(currentEdge.face1Id, resultForOneFace.mergedFaceId);
    mapOfChildFacesToMergedFaces.set(currentEdge.face2Id, resultForOneFace.mergedFaceId);
    listOfAllChildEdges.push(...resultForOneFace.edgesToUpdate);

    // update DSedges fields that are problem edges
    resultForOneFace.edgesToUpdate.forEach(item => {
      listOfDsEdgesThatNeedToBeMerged.push({face1:item.idOfMyFace, face2:item.idOfOtherFace});
    });

    // update renderer fields
    allFacesDeleted.push(currentEdge.face1Id);
    allFacesDeleted.push(currentEdge.face2Id);
    allFacesCreated.push(resultForOneFace.mergedFaceId);

  }

  console.log("GOT HERE 3");
  // now we update the rest of the adj list with problem child edges
  for(const item of listOfAllChildEdges) {
    console.log("GOT HERE 4");
    const mergedFaceAId = mapOfChildFacesToMergedFaces.get(item.idOfMyFace);
    const mergedFaceBId = mapOfChildFacesToMergedFaces.get(item.idOfOtherFace);


    // if not already seen before, do both a-b and b->a connection
    // only do if not done before
    if (!isConnectionInAdjList(mergedFaceAId, mergedFaceBId)) {
      // a->b
      addValueToAdjList(mergedFaceAId, {
        idOfOtherFace:mergedFaceBId,
        angleBetweenThem:item.angleBetweenThem,
        edgeIdOfMyFace:item.edgeIdOfMyFace,
        edgeIdOfOtherFace:item.edgeIdOfOtherFace
      });

      // b->a
      addValueToAdjList(mergedFaceBId, {
        idOfOtherFace:mergedFaceAId,
        angleBetweenThem:item.angleBetweenThem,
        edgeIdOfMyFace:item.edgeIdOfOtherFace,
        edgeIdOfOtherFace:item.edgeIdOfMyFace
      });

    }
  }


  // now we update the DS edges to be merged
  // a1-b1, a2-b2 --> a-b

  // idea here is to save if added so the second child
  // one doesn't cause any issues, don't want double a-b connections
  const setOfMergedProblemFacesUpdatedInDS: Set<{f1: bigint, f2: bigint}> = new Set<{f1: bigint, f2: bigint}>();
  for (const childPair of listOfDsEdgesThatNeedToBeMerged) {
    console.log("GOT HERE 5");
    if (mapOfChildFacesToMergedFaces.get(childPair.face1) === undefined ||
        mapOfChildFacesToMergedFaces.get(childPair.face2) === undefined) {
          throw new Error("merged face(s) not found");
    }

    // check to make sure that there won't be a "duplicate request"
    // ie a1-b1 and a2-b2 would make 2 copies of a-b connection
    const mergedAFaceId = mapOfChildFacesToMergedFaces.get(childPair.face1);
    const mergedBFaceId = mapOfChildFacesToMergedFaces.get(childPair.face2);
    for(const mergedConnection of setOfMergedProblemFacesUpdatedInDS) {
      if ((mergedConnection.f1 === mergedAFaceId && mergedConnection.f2 === mergedBFaceId) ||
      (mergedConnection.f1 === mergedBFaceId && mergedConnection.f2 === mergedAFaceId)) {
        continue;  // we've found a duplicate copy, just don't do request again
      }
    }

    // update ds edge
    ReplaceExistingConnectionsBasedOnFirstWithNewConnections(
      [{
        aFaceId: childPair.face1,
        bFaceId: childPair.face2
      }],
      [{
        face1Id:mapOfChildFacesToMergedFaces.get(childPair.face1),
        face2Id:mapOfChildFacesToMergedFaces.get(childPair.face2)
      }]
    );

    // add to set so no duplicates requests are done
    setOfMergedProblemFacesUpdatedInDS.add(
      {f1:mapOfChildFacesToMergedFaces.get(childPair.face1),
       f2:mapOfChildFacesToMergedFaces.get(childPair.face2)
      }
    );
  }

  // update lug

  // rendering
  allFacesDeleted;
  allFacesCreated;

  console.log("GOT HERE 6");
  // backend
  const allFacesCreatedObjs : Face2D[] = [];
  allFacesCreated.forEach(item => {
    const face = getFace2dFromId(item);
    if (face === undefined) {
      throw new Error("face not found for id:" + item);

    }
    allFacesCreatedObjs.push(face);
  })

  console.log("GOT HERE 7");
  let result: boolean = await addSplitFacesToDB(allFacesCreatedObjs, allFacesDeleted, stationaryFaceId);
  if (result === false) {
    throw new Error("error with db");
  }
  console.log("GOT HERE 8");
  incrementStepID();
  return true;
}





// creates a new split based on the edge, face, and what part should move
/**
 * Creates a new fold by splitting a face into two. Does not perform any rotation.
 * update the front end system,
 * and backend system accordingly
 * @param point1Id - the id of the point on the fold edge
 * @param point2Id - the id of the other point on the fold edge
 * @param faceId - the id of the face that is split into two
 * @param vertexOfFaceStationary - provide a point that is stationary in case of movement in future
 * @param angle - the angle to start between them. should be 180
 * @returns {stationaryFaceId:bigint, rotationFaceId:bigint}/ or a string of error msg
 */
async function createANewFoldBySplitting(point1Id: bigint, point2Id: bigint, faceId: bigint, vertexOfFaceStationary: Point3D, angle: bigint) {
  if (point1Id == point2Id) {
    return "Points cannot be same";
  }

  let face2d: Face2D | undefined = getFace2dFromId(faceId);
  if (face2d === undefined) {
    console.error("error getting face 2d");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    console.error("error getting face 3d");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  // if a point isn't a vertex, have to check it's on the edge of the face
  if (point1Id >= face2d.vertices.length) {
    const point1: AnnotatedPoint2D = face2d.getAnnotatedPoint(point1Id);
    if (point1.edgeID == null) {
      const myStatus: EditorStatusType = "POINT_NOT_ON_EDGE_ERROR";
      const msg = EditorStatus[myStatus].msg;
      return msg;
    }
  }

  if (point2Id >= face2d.vertices.length) {
    const pointCheck: AnnotatedPoint2D = face2d.getAnnotatedPoint(point2Id);
    if (pointCheck.edgeID == null) {
      const myStatus: EditorStatusType = "POINT_NOT_ON_EDGE_ERROR";
      const msg = EditorStatus[myStatus].msg;
      return msg;
    }
  }


  // need to get flattened 2d point
  const flattedPoint3d: Point3D | null = face3d.projectToFace(vertexOfFaceStationary);
  if (flattedPoint3d === null) {
    console.error("error getting face 3d");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  const flattedPoint2d: Point2D| null = translate3dTo2d(flattedPoint3d, faceId);
  if (flattedPoint2d === null) {
    console.error("error translating 3d to 2d");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

                                                                  //vectorTowardsLeftFaceBasedOnOgPointIds, pointAtEndOfFoldLine
  const resultOfUpdatingPaperGraph: [Face2D,Face2D,bigint,ProblemEdgeInfo[], Point2D, Point2D, Face3D, Face3D] | false= graphCreateNewFoldSplit(point1Id, point2Id, faceId, angle,flattedPoint2d);

  // do a quick double check later that it's ok to delete adjlist/mapping of old faces, assuming it splits

  if (resultOfUpdatingPaperGraph === false) {
    throw new Error("Error saving paper graph");
  }

  // let result: boolean = await addSplitFacesToDB(resultOfUpdatingPaperGraph[0], resultOfUpdatingPaperGraph[1], faceId, resultOfUpdatingPaperGraph[2]);

  // if (result === false) {
  //   throw new Error("error with db");
  // }

  if (resultOfUpdatingPaperGraph[0].ID == resultOfUpdatingPaperGraph[2]) {
    // left face is stationary
    return {stationaryFaceId:resultOfUpdatingPaperGraph[0].ID,
            rotationFaceId:resultOfUpdatingPaperGraph[1].ID,
            problemEdgesForFace:resultOfUpdatingPaperGraph[3],
            perpindicularVectorPointTowardsLeftSpaceDirection: resultOfUpdatingPaperGraph[4],
            perpindicularVectorPointTowardsLeftSpaceOrigin: resultOfUpdatingPaperGraph[5],
            splitFaceObjs:[resultOfUpdatingPaperGraph[6], resultOfUpdatingPaperGraph[7]] // stat, rot obj
    };
  }

  // right face is stationary
  return {stationaryFaceId:resultOfUpdatingPaperGraph[1].ID,
          rotationFaceId:resultOfUpdatingPaperGraph[0].ID,
          problemEdgesForFace:resultOfUpdatingPaperGraph[3],
          perpindicularVectorPointTowardsLeftSpaceDirection: resultOfUpdatingPaperGraph[4],
          perpindicularVectorPointTowardsLeftSpaceOrigin: resultOfUpdatingPaperGraph[5],
          splitFaceObjs:[resultOfUpdatingPaperGraph[7], resultOfUpdatingPaperGraph[6]] // stat, rot obj
        };
}



/**
 * Finds the intersection point of two lines defined by points (p1, p2) and (p3, p4).
 * @param p1 First point of the first line.
 * @param p2 Second point of the first line.
 * @param p3 First point of the second line.
 * @param p4 Second point of the second line.
 * @returns The intersection point or null if the lines are parallel or coincident.
 */
function getLineIntersection(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): Point2D | null {
  const denominator =
      (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);

  // If denominator is zero, the lines are parallel or coincident
  if (denominator === 0) {
      return null;
  }

  const numeratorX =
      (p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) -
      (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x);
  const numeratorY =
      (p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) -
      (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x);

  const x = numeratorX / denominator;
  const y = numeratorY / denominator;

  return createPoint2D(x, y);
}



/**
 * given point 1 and point 2, returns the id of the points (either annotation or vertex)
 * that p1 and p2 pass thru in the plane. If the points at which the user provides
 * intersect the face don't have a vertex/annotation point nearby, this method makes one
 * @param p1 - the first point in line
 * @param p2 - the second point in line
 * @param faceIdToUpdate - the id of the face to comapre to
 */
function  findPointsOnEdgeOfStackedFace(p1: Point2D,  p2: Point2D, faceIdToUpdate: bigint) {
  const face2d = getFace2dFromId(faceIdToUpdate);
  if (face2d === undefined) {
    throw new Error("couldn't find face");
  }

  // algorithm
  // we know that our line will intersect two lines if it intersects plane, so add to return list
  // contains ids of things hit: could be vertex, existing anno points, or new points
  const retList: bigint[] = [];
  // keep track of whether we make a new point
  const generated: boolean[] = [];

  console.log("we are seeing what vertex to go to")


  // go thru each vertex
  for(let i = 0n; i < face2d.N; i++) {
    if (retList.length ==  2) {
      break;
    }

    let intersectionPointOfFaceEdgeAndUserLine = getLineIntersection(
      p1, p2, face2d.getPoint(i), face2d.getPoint((i + 1n) % face2d.N)
    );




    // test purposes

  //   let annoRes2d = face2d.addAnnotatedPoint(intersectionPointOfFaceEdgeAndUserLine, i);
  //   console.log("we are making a point on the stacked face");
  //   if (annoRes2d.pointsAdded.size !== 1) {
  //     throw new Error("error making a point");
  //   }

  //   const face3d = getFace3DByID(faceIdToUpdate);

  // // add point (should just be one, but res uses map)
  // for(let pointId of annoRes2d.pointsAdded.keys()) {
  //   const pointIn3dVersion = translate2dTo3d(annoRes2d.pointsAdded.get(pointId).point, faceIdToUpdate);

  //   face3d.updateAnnotations(create3dAnnoationResultForNewPoint(pointId, pointIn3dVersion));
  // }






    ////////////////




    // this just makes sure that we are on the edge (think of round off error)
    //intersectionPointOfFaceEdgeAndUserLine = face2d.projectToEdge(intersectionPointOfFaceEdgeAndUserLine, i);

    console.log("intersection point for vertex " + i + " of " +faceIdToUpdate + ": " +intersectionPointOfFaceEdgeAndUserLine.x, + intersectionPointOfFaceEdgeAndUserLine.y);


    console.log("i: edge " + i + ":" + distance(face2d.vertices[Number(i)], intersectionPointOfFaceEdgeAndUserLine));
    // edge case, check if point is actually on the edge:
    if (distance(face2d.vertices[Number(i)], intersectionPointOfFaceEdgeAndUserLine) < 0.05) {
      // add edge as hit point
      retList.push(i);
      console.log("FOUND: added vertex");
      generated.push(false);
      continue;
    }


    if (face2d.isColinearPointInsideEdge(intersectionPointOfFaceEdgeAndUserLine, i)) {

      // our point is actually at an intersection inside the polygon, so, we've found a target
      // now we need to get the point nearby, or make one if it exists
      let closestPointId: bigint = face2d.findClosestPointOnEdge(intersectionPointOfFaceEdgeAndUserLine, i);

      // also, we check to make sure we haven't made a point that is super close to another one already created
      let exit = false;
      for(let l = 0n; l < face2d.N; l++) {
        if (distance(face2d.getPoint(l), intersectionPointOfFaceEdgeAndUserLine) <= 0.05) {
          exit = true;
          break;
        }
      }
      if (exit) {
        console.log("ive exited!");
        continue;
      }


      console.log("distance green line check", distance(face2d.getPoint(closestPointId), intersectionPointOfFaceEdgeAndUserLine));
      if (closestPointId >= face2d.N && distance(face2d.getPoint(closestPointId), intersectionPointOfFaceEdgeAndUserLine) <= USE_EXISTING_POINT_IN_GREEN_LINE) {
        // point exists, so use it
        retList.push(closestPointId);
        console.log("FOUND: added existing point", closestPointId);
        generated.push(false);
      } else {

        // need to make our own point
        let annoRes2d = face2d.addAnnotatedPoint(intersectionPointOfFaceEdgeAndUserLine, i);
        console.log("FOUND: we are making a point on the stacked face");
        if (annoRes2d.pointsAdded.size !== 1) {
          throw new Error("error making a point");
        }

        const face3d = getFace3DByID(faceIdToUpdate);

        // add point (should just be one, but res uses map)
        for(let pointId of annoRes2d.pointsAdded.keys()) {
          retList.push(pointId);
          const pointIn3dVersion = translate2dTo3d(annoRes2d.pointsAdded.get(pointId).point, faceIdToUpdate);

          face3d.updateAnnotations(create3dAnnoationResultForNewPoint(pointId, pointIn3dVersion));
        }

        generated.push(true);
      }
    }
  }

  if (retList.length >= 2) {
    console.log("RESULT", {
      pt1:{
        id:retList[0],
        gen: generated[0]
      },

      pt2:{
        id:retList[1],
        gen: generated[1]
      }});
    return {
    pt1:{
      id:retList[0],
      gen: generated[0]
    },

    pt2:{
      id:retList[1],
      gen: generated[1]
    }};

  }

  if (retList.length === 0) {
    return null;
  }

  throw new Error("you make diff number of collisions that you should have: " + retList.length);
}

/**
 * intMin returns min of a and b, but as a bigint
 * @param a - a value
 * @param b - b value
 * @returns min(a, b)
 */
function intMin(a: bigint, b: bigint) {
  if(a < b) {
    return a;
  }
  return b;
}

/**
 * intMax returns max of a and b, but as a bigint
 * @param a - a value
 * @param b - b value
 * @returns max(a, b)
 */
function intMax(a: bigint, b: bigint) {
  if(a > b) {
    return a;
  }
  return b;
}


/**
 * takes 2 pointids, and a faceid for said points, and cuts thru everything in said face
 * and any paper that is stacked on top of it, going thru the cut line
 * @param point1Id
 * @param point2Id
 * @param faceId
 * @param vertexOfFaceStationary
 * @param angle - the new angle of the faces
 * @returns
 */
export async function createMultiFoldBySplitting(point1Id: bigint, point2Id: bigint, faceId:bigint, vertexOfFaceStationary: Point3D, angle: bigint, isViewer=false) {
  setCookie(SceneManager.getOrigamiID() + " " + SceneManager.getStepID(), JSON.stringify([Number(point1Id), Number(point2Id), Number(faceId), vertexOfFaceStationary, Number(angle)]));


  const smallestPointId = intMin(point1Id, point2Id);
  const largestPointId = intMax(point1Id, point2Id);
  point1Id = smallestPointId;
  point2Id = largestPointId;


  const startFaceObj = getFace3DByID(faceId);
  if (startFaceObj === undefined) {
    throw new Error("couldn't find face");
  }

  const p1: Point3D = startFaceObj.getPoint(point1Id);
  const p2: Point3D = startFaceObj.getPoint(point2Id);

  let faceIdToUpdate: bigint[] = getOverlappingFaces(faceId); // basically, get the connect component from the LUG from faceid
  // faceIdToUpdate.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

  //faceIdToUpdate sort
  const allProblemEdges: ProblemEdgeInfo[] = []; // pairs i need to add to adj list
  const newSetOfEdgesForDS: Set<{face1Id:bigint, face2Id:bigint}> = new Set<{face1Id:bigint, face2Id:bigint}>(); // list of the "new line" drawn

  // for renderer
  const allMovingFaces : bigint[]  = [];
  const mapOfnewFaceIdsToNewObjects: Map<bigint, Face3D> = new Map<bigint, Face3D>();



  // will be set during the first iteration of the for loop
  // needed for any planes that don't intersect the cut
  let perpindicularVectorPointTowardsLeftSpaceDirection = null;
  let perpindicularVectorPointTowardsLeftSpaceOrigin = null;
  let isLeftSideRotating = false;


  // stuff for db request
  let allCreatedFaces: Face2D[] = [];
  let allDeletedFaces: bigint[] = [];

  let firstDescendentFaceIdThatStationary: bigint = -1n;
  let edgeIdOfFirstDescendentThatisStationaryThatRotatesOn: bigint = -1n;

  // stuff hady needs
  let stationaryFaceSpecifc = -1n;
  let rotatingFaceSpecific = -1n;
  let edgeIdOfStationaryFace = -1n;

  const listOfStationaryFacesInLug: bigint[] = [];
  const mapFromOgIdsToSplitFaces = new Map<bigint, [bigint] | [bigint, bigint]>();

  // for loop that first only does the split faces
  // then copy paste this loop but update so that we continue on null returns
  // split all of the faces that need to split,
  // and update adj list with this information
  for(let i = 0; i < faceIdToUpdate.length; i++) {

    console.log("CURRENT FACE I AM WORKING WITH", faceIdToUpdate[i]);
    // get face
    const currFaceId: bigint = faceIdToUpdate[i];
    const face3d = getFace3DByID(currFaceId);
    if (face3d === undefined) {
      throw new Error("couldn't find face");
    }

    const projectedP1 = translate3dTo2d(face3d.projectToFace(p1), currFaceId);
    const projectedP2 = translate3dTo2d(face3d.projectToFace(p2), currFaceId);

    if (projectedP1 === null || projectedP2 === null) {
      throw new Error("error getting split point")
    }

    const points = findPointsOnEdgeOfStackedFace(projectedP1, projectedP2, faceIdToUpdate[i]);

    // we only want to do the case where we split first
    if (points == null) {
      continue;
    }

    console.log("split running");

    const [idOnCurrFaceToSplit1, idOnCurrFaceToSplit2] = [points.pt1.id, points.pt2.id];
    // we need to split faces
    // note this also updates the adjlist of edges
    const projectedVertexStationaryOnNewFace = face3d.projectToFace(vertexOfFaceStationary);
    const targetPointOn2dSpace = translate3dTo2d(projectedVertexStationaryOnNewFace, face3d.ID);
    const resultFromSplitting = await createANewFoldBySplitting(idOnCurrFaceToSplit1, idOnCurrFaceToSplit2, currFaceId, projectedVertexStationaryOnNewFace, 180n - angle);

    if (typeof(resultFromSplitting) === 'string') {
      console.error("error creating split of a face");
      return;
    }

    // setup up left direction vector for all future iterations (only runs first time)
    if (perpindicularVectorPointTowardsLeftSpaceOrigin == null) {
      perpindicularVectorPointTowardsLeftSpaceDirection = resultFromSplitting.perpindicularVectorPointTowardsLeftSpaceDirection;
      perpindicularVectorPointTowardsLeftSpaceOrigin = resultFromSplitting.perpindicularVectorPointTowardsLeftSpaceOrigin;

      const vectorDirectionOfUserPoint = createPoint2D(
        targetPointOn2dSpace.x - perpindicularVectorPointTowardsLeftSpaceOrigin.x,
        targetPointOn2dSpace.y - perpindicularVectorPointTowardsLeftSpaceOrigin.y
      );
      // basically, is the point on left space?
      // if so, it's stationary, so left rotates only
      // if point is on otherside
      isLeftSideRotating = dotProduct(vectorDirectionOfUserPoint, perpindicularVectorPointTowardsLeftSpaceDirection) < 0;
      firstDescendentFaceIdThatStationary = resultFromSplitting.stationaryFaceId;

      const listOfConnectsForStatFace = getAdjList().get(resultFromSplitting.stationaryFaceId);
      if(listOfConnectsForStatFace === undefined) {
        throw new Error("missing face in adj list, trying to connect to inner edge a1 a2");
      }

      for(let z = 0; z < listOfConnectsForStatFace.length; z++) {
        if (listOfConnectsForStatFace[z].idOfOtherFace === resultFromSplitting.rotationFaceId) {
          // found inner split, so this must be the edge
          edgeIdOfFirstDescendentThatisStationaryThatRotatesOn = listOfConnectsForStatFace[z].edgeIdOfMyFace;
          break;
        }
      }

      // add values that should be returned to renderer
      stationaryFaceSpecifc = resultFromSplitting.stationaryFaceId;
      edgeIdOfStationaryFace = edgeIdOfFirstDescendentThatisStationaryThatRotatesOn; // bak
      rotatingFaceSpecific = resultFromSplitting.rotationFaceId;

    }


    console.log("after loop", perpindicularVectorPointTowardsLeftSpaceOrigin);



    //getFace2dFromId(resultFromSplitting.stationaryFaceId).updateAnnotations();


    listOfStationaryFacesInLug.push(resultFromSplitting.stationaryFaceId);
    mapFromOgIdsToSplitFaces.set(currFaceId, [resultFromSplitting.stationaryFaceId,
                                         resultFromSplitting.rotationFaceId]
    );
    allMovingFaces.push(resultFromSplitting.rotationFaceId);

    // values for rendered by linking ids to objects when creating the faces
    resultFromSplitting.splitFaceObjs.forEach(face => {
      mapOfnewFaceIdsToNewObjects.set(face.ID, face);
    })


    // add faces to DB request
    if(getFace2dFromId(resultFromSplitting.stationaryFaceId) === undefined ||
       getFace2dFromId(resultFromSplitting.rotationFaceId) === undefined) {
        throw new Error("descendent faces were not put in adj list before adding to db")
    }

    allCreatedFaces.push(getFace2dFromId(resultFromSplitting.stationaryFaceId));
    allCreatedFaces.push(getFace2dFromId(resultFromSplitting.rotationFaceId));

    allDeletedFaces.push(currFaceId);



    // add all the edges that the adjlist should update: Multifold update
    // note that there will be duplicate one for B,A and one for A,B
    allProblemEdges.push(...resultFromSplitting.problemEdgesForFace);


    // add new line to DS. this is my a1-a2 connection
    newSetOfEdgesForDS.add({face1Id:resultFromSplitting.stationaryFaceId , face2Id:resultFromSplitting.rotationFaceId})
  }


  if (perpindicularVectorPointTowardsLeftSpaceOrigin == null) {
    throw new Error("should have saved the split face vector");
  }



  // do rendering
  for(const [ogFaceID, splitFaceIds] of mapFromOgIdsToSplitFaces) {
    if (splitFaceIds.length === 1) {
      continue; // skip if we don't split, since descendent is self
    }


      // add planes to scene manager (for now, hady will do later)
      addFace(mapOfnewFaceIdsToNewObjects.get(splitFaceIds[0]));
      addFace(mapOfnewFaceIdsToNewObjects.get(splitFaceIds[1]));
      deleteFace(ogFaceID); // does the render deletion
  }

  console.log("for loop pt 2");



  // update faces, but only the ones that aren't split via the line
  for(let i = 0; i < faceIdToUpdate.length; i++) {
    // get face

    const currFaceId: bigint = faceIdToUpdate[i];
    const face3d = getFace3DByID(currFaceId);
    if (getFace2dFromId(currFaceId) === undefined) {
      continue; //this means we actually have a split,  which means this face has already been "done"
    }

    console.log("CURRENT FACE I AM WORKING WITH", faceIdToUpdate[i]);

    const projectedP1 = translate3dTo2d(face3d.projectToFace(p1), currFaceId);
    const projectedP2 = translate3dTo2d(face3d.projectToFace(p2), currFaceId);

    if (projectedP1 === null || projectedP2 === null) {
      throw new Error("error getting split point")
    }

    mapFromOgIdsToSplitFaces.set(currFaceId, [currFaceId]);

    const points = findPointsOnEdgeOfStackedFace(projectedP1, projectedP2, faceIdToUpdate[i]);

    // only do it if the plane we are looking at ISN"T being cut by the face
    if (points == null) {
      // line doesn't intersect plane, so just skip the splitting todo: don't delete og face until after this for loop since i need it here
      // is either static or rotating
      console.log("left/right child that comes from splitting", startFaceObj);
      print3dGraph();
      const planePointOnStartFace = startFaceObj.projectToFace(face3d.getAveragePoint());
      console.log("looking for face", startFaceObj.ID);
      print2dGraph();
      console.log("left child?")
      const planePoint2dVersion = translate3dTo2d(planePointOnStartFace, firstDescendentFaceIdThatStationary);


      console.log(perpindicularVectorPointTowardsLeftSpaceOrigin);
      const directionToPlanePoint = createPoint2D(
        planePoint2dVersion.x - perpindicularVectorPointTowardsLeftSpaceOrigin.x,
        planePoint2dVersion.y - perpindicularVectorPointTowardsLeftSpaceOrigin.y
      );

      // i can check if im on left side if they point in the same direction
      const amIonLeftSide = dotProduct(directionToPlanePoint, perpindicularVectorPointTowardsLeftSpaceDirection) > 0;

      let amIRotating = (isLeftSideRotating && amIonLeftSide) ||
                        (!isLeftSideRotating && !amIonLeftSide);

      // im not rotating, so add it to list for hady
      if (!amIRotating) {
        listOfStationaryFacesInLug.push(currFaceId);
      } else {
        allMovingFaces.push(currFaceId);
      }

      continue;
    }
  }


  // update adjlist with problematic edges
  // set is here so we don't have duplicates
  // use format Face1-Face2, can check if oppsiiste exists so that
  // we don't do it twice
  const listOfAllEdgesFixed: Set<String> = new Set<String>();
  console.log("All problem edges", allProblemEdges);
  for(const item of allProblemEdges) {
    // POV is to be from A looking to B
    // do brute force mapping
    // from A_1/A_2 edge connect B_1/B_2 edge

    // check to make sure we don't do repeat
    const hashCheck: string = item.sideB.faceIdOfMyFaceB + "-" + item.sideA.faceIdOfMyFaceA;
    if(Array.from(listOfAllEdgesFixed).includes(hashCheck)) {
      // already have fixed this edge, don't do again
      continue;
    }
    item.sideA.edgeIdOfMyFaceA // A edge
    item.sideB.edgeIdOfMyFaceB // B edge

    const aFaceId = item.sideA.faceIdOfMyFaceA;

    const a1FaceId = item.sideA.faceIdOfMyFaceA1;
    const a1EdgeId = item.sideA.edgeIdOfMyFaceA1;
    const a1FaceObj = getFace2dFromId(a1FaceId);

    const a2FaceId = item.sideA.faceIdOfMyFaceA2;
    const a2EdgeId = item.sideA.edgeIdOfMyFaceA2;
    const a2FaceObj = getFace2dFromId(a2FaceId);

    const bFaceId = item.sideB.faceIdOfMyFaceB;

    // to get the B1/B2 Faces, we need to find the B->A value which should still be in our list
    const getBrecord: ProblemEdgeInfo = getProblemEdgeRecord(bFaceId + "-" + aFaceId, allProblemEdges); // goal of this method is to get the oppsite record
                                                                                                        // from looking at B face and seeing problem edge connecting to A
    // feels weird doing this from sideA for B values, but the list is classified as
    // 'A' as the POV in the JSON object
    if (item == getBrecord) {
      throw new Error("should be oppisitie");
    }

    console.log("GET THE B RECORD", getBrecord);
    console.log("GET THE A RECORD", item)

    const b1FaceId = getBrecord.sideA.faceIdOfMyFaceA1;
    const b1EdgeId = getBrecord.sideA.edgeIdOfMyFaceA1;
    const b1FaceObj = getFace2dFromId(b1FaceId);

    const b2FaceId = getBrecord.sideA.faceIdOfMyFaceA2;
    const b2EdgeId = getBrecord.sideA.edgeIdOfMyFaceA2;
    const b2FaceObj = getFace2dFromId(b2FaceId);

    if (a1FaceObj === undefined || a2FaceObj === undefined || b1FaceObj === undefined || b2FaceObj === undefined) {
      throw new Error("Split faces don't exist");
    }

    console.log


    // manually check if the points line up
    if(areEdgesTheSame(a1FaceObj, a1EdgeId, b2FaceObj, b2EdgeId)) {
      // a1-b2 link up
      // a2-b1 link up

      // safety check to catch early error
      if(!areEdgesTheSame(a2FaceObj, a2EdgeId, b1FaceObj, b1EdgeId)) {
        throw new Error("other edges don't overlap");
      }

      // update these connections in the DS
      ReplaceExistingConnectionWithNewConnections(
        {aFaceId:aFaceId, bFaceId:bFaceId},
        [
          {face1Id:a1FaceId, face2Id:b2FaceId},
          {face1Id:a2FaceId, face2Id:b1FaceId}
        ]
      );


      // a1-b2 link up
      addValueToAdjList(
        a1FaceId,
        {
          idOfOtherFace: b2FaceId,
          angleBetweenThem: angle,
          edgeIdOfMyFace: a1EdgeId,
          edgeIdOfOtherFace: b2EdgeId
        }
      );
      addValueToAdjList(
        b2FaceId,
        {
          idOfOtherFace: a1FaceId,
          angleBetweenThem: angle,
          edgeIdOfMyFace: b2EdgeId,
          edgeIdOfOtherFace: a1EdgeId
        }
      );

      // a2-b1 link up
      addValueToAdjList(
        a2FaceId,
        {
          idOfOtherFace: b1FaceId,
          angleBetweenThem: angle,
          edgeIdOfMyFace: a2EdgeId,
          edgeIdOfOtherFace: b1EdgeId
        }
      );
      addValueToAdjList(
        b1FaceId,
        {
          idOfOtherFace: a2FaceId,
          angleBetweenThem: angle,
          edgeIdOfMyFace: b1EdgeId,
          edgeIdOfOtherFace: a2EdgeId
        }
      );

    } else {
      // a1 - b1  / a2 - b2 link up
      // safety check to catch early error
      if(!areEdgesTheSame(a1FaceObj, a1EdgeId, b1FaceObj, b1EdgeId)) {
        throw new Error("other edges don't overlap");
      }
      if(!areEdgesTheSame(a2FaceObj, a2EdgeId, b2FaceObj, b2EdgeId)) {
        throw new Error("other edges don't overlap");
      }

      // replace old edge with new ones
      ReplaceExistingConnectionWithNewConnections(
        {aFaceId: aFaceId, bFaceId: bFaceId},
        [
          {face1Id: a1FaceId, face2Id: b1FaceId},
          {face1Id: a2FaceId, face2Id: b2FaceId}
        ]
      );


      // a1-b1 link up
      addValueToAdjList(
        a1FaceId,
        {
          idOfOtherFace: b1FaceId,
          angleBetweenThem: angle,
          edgeIdOfMyFace: a1EdgeId,
          edgeIdOfOtherFace: b1EdgeId
        }
      );
      addValueToAdjList(
        b1FaceId,
        {
          idOfOtherFace: a1FaceId,
          angleBetweenThem: angle,
          edgeIdOfMyFace: b1EdgeId,
          edgeIdOfOtherFace: a1EdgeId
        }
      );


      // a2-b2 link up
      addValueToAdjList(
        a2FaceId,
        {
          idOfOtherFace: b2FaceId,
          angleBetweenThem: angle,
          edgeIdOfMyFace: a2EdgeId,
          edgeIdOfOtherFace: b2EdgeId
        }
      );
      addValueToAdjList(
        b2FaceId,
        {
          idOfOtherFace: a2FaceId,
          angleBetweenThem: angle,
          edgeIdOfMyFace: b2EdgeId,
          edgeIdOfOtherFace: a2FaceId
        }
      );
    }

    // mark this completed in set
    listOfAllEdgesFixed.add(aFaceId + "-" + bFaceId);
  }


  // update disjointset: keep in mind i just need to know what goes together
  // i can use the lug to find out what things should be stationary by looking
  // thru the "set"
  // to do the update disjoint sets,
  // 1) add a new set that comes from all the split lines
  // 2) update the trouble edges by removing OG connection A-B and replacing it
  //    with new connections A1-B1/B2 and vice versa
  // add new edge: newSetOfEdgesForDS
  // update all existing edges that have split. come from problem children
  AddNewEdgeToDisjointSet(newSetOfEdgesForDS);

  // do lug
  console.log("HERE:____");
  console.log(stationaryFaceSpecifc);
  console.log(rotatingFaceSpecific);
  console.log(mapFromOgIdsToSplitFaces);
  console.log(180n - angle);
  console.log(listOfStationaryFacesInLug);
  console.log("END:____");
  const offsets: Map<bigint, number>  = faceMutatingFold(stationaryFaceSpecifc, rotatingFaceSpecific, 180n, 180n - angle,
    edgeIdOfStationaryFace, mapFromOgIdsToSplitFaces, new Set<bigint>(listOfStationaryFacesInLug)
  );


  console.log("ALL MOVING FACES", allMovingFaces);
  console.log("edges not to cross", newSetOfEdgesForDS);
  console.log("adj list at this point", getAdjList());

  // update renderer with animation
  // all set - stationary
  // todo: include all moving faces from BFS in this list
  const allFacesThatMoveForAnyReason: bigint[] = Array.from(BFS(allMovingFaces, newSetOfEdgesForDS));

  animateFold(firstDescendentFaceIdThatStationary, edgeIdOfFirstDescendentThatisStationaryThatRotatesOn, Number(angle),
    ...allFacesThatMoveForAnyReason
  );
  animateOffset(offsets);

  console.log("FINAL RESULT OF OFFSETS", offsets);

  if(!isViewer) {
    // update backend
    let result: boolean = await addSplitFacesToDB(allCreatedFaces, allDeletedFaces, firstDescendentFaceIdThatStationary);
    if (result === false) {
      throw new Error("error with db");
    }
  }



  // debug info
  console.log("Action:");
  console.log(getAdjList());
  print2dGraph();
  print3dGraph();

  // update step counter
  incrementStepID();
}


/**
 *
 * @param pairingToLookFor - hash combo to look for in format "FaceId1-FaceId2"
 * @param allProblemEdges - the list to look for in this list
 */
function getProblemEdgeRecord(pairingToLookFor: string, allProblemEdges: ProblemEdgeInfo[]) {
  console.log("PE", allProblemEdges);
  for(const item of Array.from(allProblemEdges)) {
    const thisHash = item.sideA.faceIdOfMyFaceA + "-" + item.sideB.faceIdOfMyFaceB;
    if (pairingToLookFor === thisHash) {
      return item;
    }
  }

  throw new Error("could find pairing:" + pairingToLookFor);
}

const CLOSE_ENOUGH_SO_POINTS_ARE_SAME = 0.02

/**
 * returns if the face and edges are the same
 * @param faceObj1 - obj 1
 * @param edgeIdForFace1 - edge of obj 1
 * @param faceObj2  - obj 2
 * @param edgeIdForFace2 - edge of obj 2
 * @returns - booelan
 */
function areEdgesTheSame(faceObj1: Face2D, edgeIdForFace1: bigint, faceObj2: Face2D, edgeIdForFace2: bigint) {
  // to get "edge", just get edgeId vertex and edgeID + 1 vertex
  const edge1Point1: Point2D = faceObj1.getPoint(edgeIdForFace1);
  const edge1Point2: Point2D = faceObj1.getPoint((edgeIdForFace1 + 1n) % faceObj1.N);

  const edge2Point1: Point2D = faceObj2.getPoint(edgeIdForFace2);
  const edge2Point2: Point2D = faceObj2.getPoint((edgeIdForFace2 + 1n) % faceObj2.N);

  const case1: boolean = distance(edge1Point1, edge2Point1) < CLOSE_ENOUGH_SO_POINTS_ARE_SAME &&
                         distance(edge1Point2, edge2Point2) < CLOSE_ENOUGH_SO_POINTS_ARE_SAME;

  const case2: boolean = distance(edge1Point2, edge2Point1) < CLOSE_ENOUGH_SO_POINTS_ARE_SAME &&
                         distance(edge1Point1, edge2Point2) < CLOSE_ENOUGH_SO_POINTS_ARE_SAME;
  return case1 || case2
}


/**
 * Creates a new fold operation by merging two faces that are together (180 degrees apart)
 * updates all possible edges it can
 * @param faceId1 - the id of the first face to be merged
 * @param faceId2 - the id of the other face to be merged
 * @returns - the problem edges to update at very end and new merged face id, or str error
 */
export async function createANewFoldByMerging(faceId1: bigint, faceId2: bigint) {
  if (faceId1 == faceId2) {
    return "Faces are the same";
  }

  let face2d1: Face2D | undefined = getFace2dFromId(faceId1);
  if (face2d1 === undefined) {
    console.error("error getting face 2d");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  const resFrontend = mergeFaces(faceId1, faceId2);
  if (resFrontend === false) {
    console.error("error getting face 2d");
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  // get all edges from DS and put into list, deleting isolated copy
  const dsEdges: {face1Id: bigint,face2Id: bigint}[] = Array.from(getDisjointSetEdgeAndDelete(faceId1, faceId2));
  const listOfDsEdges : bigint[] = [];

  dsEdges.forEach(item => {
    listOfDsEdges.push(item.face1Id);
    listOfDsEdges.push(item.face2Id);
  });



  const [mergedFace, leftFacePointIdsToNewIds, rightFacePointIdsToNewIds] = resFrontend;
  // i get back the update adj list except for problem child
  const edgesINeedToUdpate: EdgesAdjListMerging[] = updateAdjListForMergeGraph(mergedFace.ID, faceId1, faceId2, listOfDsEdges, leftFacePointIdsToNewIds,rightFacePointIdsToNewIds);



  return {mergedFaceId:mergedFace.ID, edgesToUpdate:edgesINeedToUdpate};
}



/**
 * Given a provided point (ie you can provided the layered shot, no need to
 * project), and a face id, updates all frontend systems and backend systems
 * with adding a new annotation point
 * @param point - the point to be added [note: will be projected onto face]
 * @param faceId - the face to add the point to
 * @returns either true, or a message about while the action failed
 */
export async function addAnnotationPoint(point: Point3D, faceId: bigint, edgeId: bigint = -1n) : Promise<string | true> {
  // add points to frontend

  // add annotation point to face3d [ie in SceneManager]
  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    console.error("face 3d id doesn't exists", faceId );
    const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  let flattedPoint: Point3D | null = face3d.projectToFace(point);
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

  let addPointResult: AnnotationUpdate2D = face2d.addAnnotatedPoint(getTranslated2dPoint, edgeId);
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
  console.log("pointId", pointId);
  face3d.updateAnnotations(create3dAnnoationResultForNewPoint(pointId, flattedPoint));

  let result: boolean = await addUpdatedAnnoationToDB(addPointResult, faceId);

  if (!result) {
    const myStatus: EditorStatusType = "BACKEND_500_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }

  console.log("Action:");
  console.log(getAdjList());
  print2dGraph();
  print3dGraph();

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

  face3d.updateAnnotations(update3dObjectResults);

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
    return "Cannot click the same point"; // todo: update will fail for user
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
  // annotation line between two adjacent vertices disallowed.
  if (point1Id < face3d.N && point2Id < face3d.N) {
    if (point1Id === (point2Id + 1n) % face3d.N || point2Id === (point1Id + 1n) % face3d.N) {
      return "Cannot draw an annotated line along an edge!";
    }
  }


  // frontend changes
  let updateState2dResults: AnnotationUpdate2D = face2D.addAnnotatedLine(point1Id, point2Id);
  const update3dObjectResults = convertAnnotationsForDeletes(updateState2dResults, faceId);
  if (update3dObjectResults == null) {
    return "Error: couldn't generated 3d updated object";
  }

  face3d.updateAnnotations(update3dObjectResults);

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

  face3d.updateAnnotations(update3dObjectResults);

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
 * Takes a 3d point in space and returns the prjected point in 2d space
 * @param point - the point to project
 * @param faceId - the id of the face to project to
 * @returns the translated 2d point, or null if there's an error
 */
function getConvertedPoint2D(point: Point3D, faceId: bigint) : Point2D | null{
  let face3d: Face3D | undefined = getFace3DByID(faceId);
  if (face3d === undefined) {
    return null;
  }

  let flattedPoint: Point3D | null = face3d.projectToFace(point);
  if (flattedPoint == null) {
    return null;
  }


  // add annotated point to face2d [ie in paper module]
  let face2d: Face2D | undefined = getFace2dFromId(faceId);
  if (face2d === undefined) {
    return null;
  }
  let getTranslated2dPoint: Point2D | null = translate3dTo2d(flattedPoint, faceId);
  if (getTranslated2dPoint == null) {
    return null;
  }

  return getTranslated2dPoint;
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
function projectPointToFacze(point: Point3D, face3d: Face3D): Point3D | null {
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
export function translate2dTo3d(point: Point2D, faceId: bigint) : Point3D | null {
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
  // bak
   const othroBasis = getPlaneBasis2D(face2d);
    const translatedPoint3d: Point3D[] = projectToPlane2D(othroBasis, point);

    const getPlaneBasisFor3d: PlaneBasis3D = getPlaneBasis(face3d);
    const translatedPoint: Point3D = basisToWorld(getPlaneBasisFor3d, translatedPoint3d[0]);

    return translatedPoint;

  // let points : Point2D[] = [];
  // for (let i = 0; i < 3; i++) {
  //   points.push(face2d.vertices[i]);
  // }

  // const basis1 : Point2D = createPoint2D(
  //   points[1].x - points[0].x,
  //   points[1].y - points[0].y,
  // );


  // const basis2 : Point2D = createPoint2D(
  //   points[2].x - points[0].x,
  //   points[2].y - points[0].y,
  // );

  // let basisResult = solve2dSystemForScalars(
  //   [basis1.x, basis1.y],
  //   [basis2.x, basis2.y],
  //   [point.x, point.y]
  // );


  // if (basisResult == null) {
  //   console.log("NO SOLUTION");
  //   return null;
  // }


  // // because our problem is isometric, use the same coordinates for our
  // // new basis vectors rotated on the 2d plane
  // const point0in3D : Point3D = face3d.vertices[0];
  // const point1in3D : Point3D = face3d.vertices[1];
  // const point2in3D : Point3D = face3d.vertices[2];

  // const basis1in3d : Point3D = createPoint3D(
  //   point1in3D.x - point0in3D.x,
  //   point1in3D.y - point0in3D.y,
  //   point1in3D.z - point0in3D.z
  // );

  // const basis2in3d : Point3D = createPoint3D(
  //   point2in3D.x - point0in3D.x,
  //   point2in3D.y - point0in3D.y,
  //   point2in3D.z - point0in3D.z
  // );

  // const coverted3dPoint = createPoint3D(
  //   basis1in3d.x * basisResult[0] +  basis2in3d.x * basisResult[1],
  //   basis1in3d.y * basisResult[0] +  basis2in3d.y * basisResult[1],
  //   basis1in3d.z * basisResult[0] +  basis2in3d.z * basisResult[1]
  // );

  // return coverted3dPoint;
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


/**
 * Given a provided point (ie you can provided the layered shot, no need to
 * project), and a face id, updates all frontend systems and backend systems
 * with adding a new annotation point
 * @param point - the point to be added [note: will be projected onto face]
 * @param faceId - the face to add the point to
 * @returns either true, or a message about while the action failed
 */
export async function displayAnnotations(startStep: bigint, endStep: bigint, isForward: boolean) : Promise<string | true> {
  // get the response from the backend
  const response = await getStepFromDB(startStep, endStep, isForward);
  if (!response) {
    const myStatus: EditorStatusType = "BACKEND_500_ERROR";
    const msg = EditorStatus[myStatus].msg;
    return msg;
  }
  return true;
}

/**
 * given a result from the backend, process the annotation step
 * @param result - the update result from the backend
 * @returns either true, or a message about while the action failed
 */
export async function processAnnotationStep(result: any) : Promise<string | true> {
  for (let i = 0; i < result.annotations.length; i++) {
    const newPointsMap2d = new Map<bigint, AnnotatedPoint2D>();
    const newPointsMap3d = new Map<bigint, AnnotatedPoint3D>();
    const pointsDeleted: bigint[] = [];
    const linesAdded = new Map<bigint, AnnotatedLine>();
    const linesDeleted: bigint[] = [];
    //update for face i

    const faceId : bigint = BigInt(result.annotations[i].idInOrigami);

    // get the face2d object
    const face2d: Face2D | undefined = getFace2dFromId(faceId);
    if (face2d === undefined) {
      console.error("face 2d id doesn't exists");
      const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
      const msg = EditorStatus[myStatus].msg;
      return msg;
    }

    // get the face3d object
    const face3d: Face3D | undefined = getFace3DByID(faceId);
    if (face3d === undefined) {
      console.error("face 3d id doesn't exists", faceId );
      const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
      const msg = EditorStatus[myStatus].msg;
      return msg;
    }

    // points added
    for (let j = 0; j < result.annotations[i].points.length; j++) {
      const point2d = createPoint2D(result.annotations[i].points[j].x, result.annotations[i].points[j].y);
      const point3d = translate2dTo3d(point2d, faceId);
      if (point3d === null) {
        console.error("Point creation isn't on plane");
        const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
        const msg = EditorStatus[myStatus].msg;
        return msg;
      }
      const flattedPoint: Point3D | null = face3d.projectToFace(point3d);
      if (flattedPoint == null) {
        console.error("Point creation isn't on plane");
        const myStatus: EditorStatusType = "FRONTEND_SYSTEM_ERROR";
        const msg = EditorStatus[myStatus].msg;
        return msg;
      }

      const newAnnoPoint2d: AnnotatedPoint2D = {
        point: point2d,
        edgeID: result.annotations[i].points[j].onEdgeIdInFace,
      };
      newPointsMap2d.set(BigInt(result.annotations[i].points[j].idInFace), newAnnoPoint2d);

      const newAnnoPoint3d: AnnotatedPoint3D = {
        point: flattedPoint,
        edgeID: result.annotations[i].points[j].onEdgeIdInFace,
      };
      newPointsMap3d.set(BigInt(result.annotations[i].points[j].idInFace), newAnnoPoint3d);


    }

    // lines added
    for (let j = 0; j < result.annotations[i].lines.length; j++) {
      const newAnnoLine: AnnotatedLine = {
        startPointID: BigInt(result.annotations[i].lines[j].point1IdInFace),
        endPointID: BigInt(result.annotations[i].lines[j].point2IdInFace),
      };
      linesAdded.set(BigInt(result.annotations[i].lines[j].idInFace), newAnnoLine);
    }

    // points deleted
    for (let j = 0; j < result.annotations[i].deletedPoints.length; j++) {
      pointsDeleted.push(BigInt(result.annotations[i].deletedPoints[j]));
    }

    // lines deleted
    for (let j = 0; j < result.annotations[i].deletedLines.length; j++) {
      linesDeleted.push(BigInt(result.annotations[i].deletedLines[j]));
    }

    // update the face2d
    const update2d: AnnotationUpdate2D = {
      status: "NORMAL",
      pointsAdded: newPointsMap2d,
      pointsDeleted: pointsDeleted,
      linesAdded: linesAdded,
      linesDeleted: linesDeleted
    }

    // update the face3d
    const update3d: AnnotationUpdate3D = {
      pointsAdded: newPointsMap3d,
      pointsDeleted: pointsDeleted,
      linesAdded: linesAdded,
      linesDeleted: linesDeleted
    }

    face2d.updateAnnotations(update2d);
    face3d.updateAnnotations(update3d);

  }
}

/**
 * deals with doing the viewer for the fold
 * @param result - the backend code
 * @param stepId - the new step id of the action
 * @returns
 */
export async function processFoldStep(result: any, stepId: number) : Promise<string | true> {
  const origamiId: number = Number(localStorage.getItem("currentOrigamiIdForViewer"));

  console.log(result);
  const parameter = getCookie(origamiId + " " + stepId);

  const parameterJson = JSON.parse(parameter);
  // localStorage.setItem(SceneManager.getOrigamiID() + " " + SceneManager.getStepID(), JSON.stringify([point1Id, point2Id, faceId, vertexOfFaceStationary, angle]));

  //  bak
  const pointId1: bigint = BigInt(parameterJson[0]);
  const pointId2: bigint = BigInt(parameterJson[1]);

  const faceId: bigint = BigInt(parameterJson[2]);

  const vertexOfFaceStationary: any = parameterJson[3];
  const angle: bigint = BigInt(parameterJson[4]);

  createMultiFoldBySplitting(pointId1, pointId2, faceId, vertexOfFaceStationary, angle, true);

  return true;


  // console.log("result", result);
  // console.log("we got here!");


  // const facesJsonList: any[] = result.foldForward.faces;
  // console.log(result);
  // // algorithm
  // // get all of the added faces id, and sort them
  // const mappingOfFaceIdToIndexInBackendArray: Map<bigint, number> = new Map<bigint, number>();
  // const allFacesCreated: bigint[] = [];
  // for(let i = 0; i < facesJsonList.length; i++) {
  //   allFacesCreated.push(facesJsonList[i].idInOrigami);
  //   mappingOfFaceIdToIndexInBackendArray.set(BigInt(facesJsonList[i].idInOrigami), i);
  // }
  // // sort the faces
  // allFacesCreated.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));



  // // get all of the deleted faces id, and sort them
  // const allFacesDeleted = result.foldForward.deletedFaces;
  // allFacesDeleted.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

  // // now find the edge that connection smallestChild1 to smallestChild2
  // const originalFace: Face2D = getFace2dFromId(BigInt(allFacesDeleted[0]));
  // console.log("id of deleted", originalFace);
  // const smallestFace = facesJsonList[mappingOfFaceIdToIndexInBackendArray.get(BigInt(allFacesCreated[0]))];
  // const smallestFaceRight = facesJsonList[mappingOfFaceIdToIndexInBackendArray.get(BigInt(allFacesCreated[1]))];

  // // find points to split edge in og face
  // const pointId1 = findEdgeConnection(smallestFace, smallestFaceRight.idInOrigami);

  // const pointId2 = Number(BigInt(pointId1 + 1) % BigInt(smallestFace.vertices.length));

  // const point1Json = smallestFace.vertices[pointId1];
  // const point1Obj = createPoint2D(point1Json.x, point1Json.y);
  // const point2Json = smallestFace.vertices[pointId2];
  // const point2Obj = createPoint2D(point2Json.x, point2Json.y);

  // const pointId1OnOgFace = originalFace.findClosestPoint(point1Obj);
  // const pointId2OnOgFace = originalFace.findClosestPoint(point2Obj);

  // const anchoredFaceId = result.foldForward.anchoredFaceIdInOrigami;
  // // now we need to find the moving face
  // // run the editor split method
  // // bak



  // //createMultiFoldBySplitting(pointId1OnOgFace, pointId2OnOgFace, originalFace.ID, )
  // return true;
}

/**
 * returns the edge connection of th eface
 * @param faceObject - the backend data
 * @param faceId2 - the id of the face
 * @returns
 */
function findEdgeConnection(faceObject: any, faceId2: bigint) {
  for(const edge of faceObject.edges) {
    if (edge.otherFaceIdInOrigami == Number(faceId2)) {
      return edge.idInFace;
    }
  }
}

/**
 * set a cookie for the step
 * @param name - name of cookie
 * @param value - value of cookie
 * @param days - how many days it lasts
 */
export function setCookie(name: string, value: string, days: number = 3650) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}

/**
 * gets value of cookie
 * @param name - name of cookie to get
 * @returns
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=");
      if (cookieName === name) {
          return decodeURIComponent(cookieValue);
      }
  }
  return null;
}
