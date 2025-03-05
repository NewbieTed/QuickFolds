/**
 * @fileoverview This file implements the layer of connection between the
 * 3D world edited by UI and managed by SceneManager, and the 2D world
 * managed by PaperManager. The controller is further responsible for
 * making appropriate calls to backend through the RequestHandler.
 */

import * as THREE from 'three';
import { AnnotationUpdate3D, Face3D } from "../geometry/Face3D.js";
import { AnnotationUpdate2D, Face2D } from '../geometry/Face2D.js'; // export Face 2d
import { createPoint2D, createPoint3D, Point3D, Point2D, AnnotatedLine, AnnotatedPoint3D, Point, processTransationFrom3dTo2d, AnnotatedPoint2D, distance, dotProduct } from "../geometry/Point.js";
import {addMergeFoldToDB, addSplitFacesToDB, addUpdatedAnnoationToDB} from "./RequestHandler.js";
import {AddNewEdgeToDisjointSet, addValueToAdjList, BFS, getAdjList, getAllFaceIds, getDisjointSetEdge, getFace2dFromId, print2dGraph, printAdjList, ReplaceExistingConnectionWithNewConnections, updateAdjListForMergeGraph, updateRelativePositionBetweenFacesIndependentOfRelativeChange} from "../model/PaperGraph.js"
import { getFace3DByID, incrementStepID, print3dGraph, animateFold } from '../view/SceneManager.js';
import { EditorStatus, EditorStatusType } from '../view/EditorMessage.js';
import { graphCreateNewFoldSplit, mergeFaces, ProblemEdgeInfo } from '../model/PaperManager.js';


const USE_EXISTING_POINT_IN_GREEN_LINE = 0.0075;



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
export async function updateAnExistingFold(faceId1: bigint, faceId2: bigint, stationaryFace:bigint, relativeChange: bigint) {
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



export function updateExistingMultiFold(faceId1: bigint, faceId2: bigint, stationaryFace:bigint, relativeChange: bigint) {
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


  const pointOfStationarySide: Point3D = getFace3DByID(stationaryFace).getAveragePoint();

  // get edge id of rotation for animation
  let edgeIdOfRot: bigint = -1n;

  const edgeIDsStart = updateRelativePositionBetweenFacesIndependentOfRelativeChange(
    faceId1, faceId2, relativeChange
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
    updateRelativePositionBetweenFacesIndependentOfRelativeChange(
      edge.face1Id, edge.face2Id, relativeChange
    );
  }
  // todo fix: deal with if first for loop iteration doesn't split

  // then i need to check if new connection is 180,
  // if so i need to merge and not update db and call merge method
  // otherwise i need to just update db

  animateFold(stationaryFace, edgeIdOfRot, Number(relativeChange), ...allMovingFaces);


  // todo: get moving faces of all children split by
  // taking the average point of the face and projecting it to first
  // split and seeing what side it's one of edge


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
export async function createANewFoldBySplitting(point1Id: bigint, point2Id: bigint, faceId: bigint, vertexOfFaceStationary: Point3D, angle: bigint) {
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
  const flattedPoint3d: Point3D | null = projectPointToFace(vertexOfFaceStationary, face3d);
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
  const resultOfUpdatingPaperGraph: [Face2D,Face2D,bigint,ProblemEdgeInfo[], Point2D, Point2D] | false= graphCreateNewFoldSplit(point1Id, point2Id, faceId, angle,flattedPoint2d);

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
            perpindicularVectorPointTowardsLeftSpaceOrigin: resultOfUpdatingPaperGraph[5]
    };
  }

  // right face is stationary
  return {stationaryFaceId:resultOfUpdatingPaperGraph[1].ID,
          rotationFaceId:resultOfUpdatingPaperGraph[0].ID,
          problemEdgesForFace:resultOfUpdatingPaperGraph[3],
          perpindicularVectorPointTowardsLeftSpaceDirection: resultOfUpdatingPaperGraph[4],
          perpindicularVectorPointTowardsLeftSpaceOrigin: resultOfUpdatingPaperGraph[5]
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
  const retList: bigint[] = [];
  // keep track of whether we make a new point
  const generated: boolean[] = [];

  // go thru each vertex
  for(let i = 0n; i < face2d.N; i++) {
    let intersectionPointOfFaceEdgeAndUserLine = getLineIntersection(
      p1, p2, face2d.getPoint(i), face2d.getPoint((i + 1n) % face2d.N)
    );

    // this just makes sure that we are on the edge (think of round off error)
    intersectionPointOfFaceEdgeAndUserLine = face2d.projectToEdge(intersectionPointOfFaceEdgeAndUserLine, i);

    // edge case, check if point is actually on the edge:
    if (distance(face2d.vertices[Number(i)], intersectionPointOfFaceEdgeAndUserLine) < 0.075) {
      // add edge as hit point
      retList.push(i);
      generated.push(false);
      continue;
    }


    if (face2d.isColinearPointInsideEdge(intersectionPointOfFaceEdgeAndUserLine, i)) {

      // our point is actually at an intersection inside the polygon, so, we've found a target
      // now we need to get the point nearby, or make one if it exists
      let closestPointId: bigint = face2d.findClosestPointOnEdge(intersectionPointOfFaceEdgeAndUserLine, i);
      if (distance(face2d.getPoint(closestPointId), intersectionPointOfFaceEdgeAndUserLine) <= USE_EXISTING_POINT_IN_GREEN_LINE) {
        // point exists, so use it
        retList.push(closestPointId);
        generated.push(false);
      } else {

        // need to make our own point
        let annoRes2d = face2d.addAnnotatedPoint(intersectionPointOfFaceEdgeAndUserLine, i);
        if (annoRes2d.pointsAdded.size !== 1) {
          throw new Error("error making a point");
        }

        // add point (should just be one, but res uses map)
        for(let pointId of annoRes2d.pointsAdded.keys()) {
          retList.push(pointId);
        }
        generated.push(true);
      }
    }
  }

  if (retList.length === 2) {
    return {
    pt1:{
      id:retList[0],
      gen: generated[0]
    },

    pt2:{
      id:retList[1],
      gen: generated[0]
    }};

  }

  if (retList.length === 0) {
    return null;
  }

  throw new Error("you make diff number of collisions that you should have: " + retList.length);
}




// multifold udpate; final boss split method
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
export async function createMultiFoldBySplitting(point1Id: bigint, point2Id: bigint, faceId:bigint, vertexOfFaceStationary: Point3D, angle: bigint) {
  const startFaceObj = getFace3DByID(faceId);
  if (startFaceObj === undefined) {
    throw new Error("couldn't find face");
  }

  const p1: Point3D = startFaceObj.getPoint(point1Id);
  const p2: Point3D = startFaceObj.getPoint(point2Id);

  let faceIdToUpdate: bigint[] = null; // basically, get the connect component from the LUG from faceid
  //faceIdToUpdate sort
  const allProblemEdges: ProblemEdgeInfo[] = []; // pairs i need to add to adj list
  const newSetOfEdgesForDS: Set<{face1Id:bigint, face2Id:bigint}> = new Set<{face1Id:bigint, face2Id:bigint}>(); // list of the "new line" drawn

  // for renderer
  const allMovingFaces : bigint[]  = [];
  // current tasks:
  // do DB management of making only one call
  // recheck adj/ds list reasoning, not trying to get something that doesn't exist anymore
  // make test request?
  // see if you can create order to items

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
  const listOfStationaryFacesInLug: bigint[] = [];
  const mapFromOgIdsToSplitFaces: Map<bigint, {face1Id:bigint, face2Id:bigint}> = new Map<bigint, {face1Id:bigint, face2Id:bigint}>();

  // split all of the faces that need to split,
  // and update adj list with this information
  for(let i = 0; i < faceIdToUpdate.length; i++) {
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
    if (points == null) {
      // line doesn't intersect plane, so just skip the splitting todo: don't delete og face until after this for loop since i need it here
      // is either static or rotating
      const planePointOnStartFace = startFaceObj.projectToFace(face3d.getAveragePoint());
      const planePoint2dVersion = translate3dTo2d(planePointOnStartFace, startFaceObj.ID);

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

    const [idOnCurrFaceToSplit1, idOnCurrFaceToSplit2] = [points.pt1.id, points.pt2.id];
    // we need to split faces
    // note this also updates the adjlist of edges
    const projectedVertexStationaryOnNewFace = face3d.projectToFace(vertexOfFaceStationary);
    const targetPointOn2dSpace = translate3dTo2d(projectedVertexStationaryOnNewFace, face3d.ID);
    const resultFromSplitting = await createANewFoldBySplitting(idOnCurrFaceToSplit1, idOnCurrFaceToSplit2, currFaceId, projectedVertexStationaryOnNewFace, angle); // todo: update backend so that we don't add a step here

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


    }


    //getFace2dFromId(resultFromSplitting.stationaryFaceId).updateAnnotations();

    // add values that should be returned to renderer
    listOfStationaryFacesInLug.push(resultFromSplitting.stationaryFaceId);
    mapFromOgIdsToSplitFaces.set(currFaceId, {face1Id:resultFromSplitting.stationaryFaceId,
                                          face2Id:resultFromSplitting.rotationFaceId
    });
    allMovingFaces.push(resultFromSplitting.rotationFaceId);


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


  // update adjlist with problematic edges
  // set is here so we don't have duplicates
  // use format Face1-Face2, can check if oppsiiste exists so that
  // we don't do it twice
  const listOfAllEdgesFixed: Set<String> = new Set<String>();
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

    const b1FaceId = getBrecord.sideA.faceIdOfMyFaceA1;
    const b1EdgeId = getBrecord.sideA.edgeIdOfMyFaceA1;
    const b1FaceObj = getFace2dFromId(b1FaceId);

    const b2FaceId = getBrecord.sideA.faceIdOfMyFaceA1;
    const b2EdgeId = getBrecord.sideA.edgeIdOfMyFaceA2;
    const b2FaceObj = getFace2dFromId(b2FaceId);

    if (a1FaceObj === undefined || a2FaceObj === undefined || b1FaceObj === undefined || b2FaceObj === undefined) {
      throw new Error("Split faces don't exist");
    }

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
          idOfOtherFace: a1FaceId,
          angleBetweenThem: angle,
          edgeIdOfMyFace: b2EdgeId,
          edgeIdOfOtherFace: a1EdgeId
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
  // UpdateDisjointSetOfEdges();
  // add new edge: newSetOfEdgesForDS
  // update all existing edges that have split. come from problem children
  AddNewEdgeToDisjointSet(newSetOfEdgesForDS);
  // HADY update lug
  ;

  // update renderer with animation
  // all set - stationary
  // todo: include all moving faces from BFS in this list
  const allFacesThatMoveForAnyReason: bigint[] = Array.from(BFS(allMovingFaces, newSetOfEdgesForDS));
  animateFold(firstDescendentFaceIdThatStationary, edgeIdOfFirstDescendentThatisStationaryThatRotatesOn, Number(angle),
    ...allFacesThatMoveForAnyReason
  );

  let result: boolean = await addSplitFacesToDB(allCreatedFaces, allDeletedFaces, firstDescendentFaceIdThatStationary);

  if (result === false) {
    throw new Error("error with db");
  }

  // todo: update the lug
  // functionCall(listOfStationaryFacesInLug, mapFromOgIdsToSplitFaces);



  print2dGraph();
  print3dGraph();
  printAdjList();

  incrementStepID();
}


// goal of this method is to get the oppsite record
/**
 *
 * @param pairingToLookFor - hash combo to look for in format "FaceId1-FaceId2"
 * @param allProblemEdges - the list to look for in this list
 */
function getProblemEdgeRecord(pairingToLookFor: string, allProblemEdges: ProblemEdgeInfo[]) {
  for(const item of Array.from(allProblemEdges)) {
    const thisHash = item.sideA.faceIdOfMyFaceA + "-" + item.sideB.faceIdOfMyFaceB
    if (pairingToLookFor === thisHash) {
      return item;
    }
  }

  throw new Error("could find pairing:" + pairingToLookFor);
}

const CLOSE_ENOUGH_SO_POINTS_ARE_SAME = 0.02

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
 * @param faceId1 - the id of the first face to be merged
 * @param faceId2 - the id of the other face to be merged
 * @returns - true, or a string message error
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

  const [mergedFace, leftFacePointIdsToNewIds, rightFacePointIdsToNewIds] = resFrontend;
  updateAdjListForMergeGraph(mergedFace.ID, faceId1, faceId2, leftFacePointIdsToNewIds,rightFacePointIdsToNewIds);

  let result: boolean = await addMergeFoldToDB(faceId1, faceId2, mergedFace);

  // print2dGraph();
  // print3dGraph();
  printAdjList();

  incrementStepID();
  return true;
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
  face3d.updateAnnotations(create3dAnnoationResultForNewPoint(pointId, flattedPoint));

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

  let flattedPoint: Point3D | null = projectPointToFace(point, face3d);
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
  let points : Point2D[] = [];
  for (let i = 0; i < 3; i++) {
    points.push(face2d.vertices[i]);
  }

  const basis1 : Point2D = createPoint2D(
    points[1].x - points[0].x,
    points[1].y - points[0].y,
  );


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
    console.log("NO SOLUTION");
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