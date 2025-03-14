/**
 * @fileoverview This file is an implementation of a graph of 2DFace objects
 * with public methods to manipulate the graph at a basic level.
 */

import { Face2D } from "../geometry/Face2D.js";
import { createPoint2D, distance, Point, Point2D } from "../geometry/Point.js";
import { ProblemEdgeInfo, ProblemEdgeInfoMerge } from "./PaperManager.js";

/**
 * stores the values of the adjacency list when doing folds
 */
export type EdgesAdjList = {
    readonly idOfOtherFace: bigint;
    readonly angleBetweenThem: bigint;
    readonly edgeIdOfMyFace: bigint;
    readonly edgeIdOfOtherFace: bigint;
}

/**
 * stores the values of the adjacency list when doing folds
 * used for sending data back up for merging
 */
export type EdgesAdjListMerging = {
  readonly idOfMyFace: bigint;
  readonly idOfOtherFace: bigint;
  readonly angleBetweenThem: bigint;
  readonly edgeIdOfMyFace: bigint;
  readonly edgeIdOfOtherFace: bigint;
}


/**
 * treat is as it you are doing
 * set.has({face1, face2})
 * ts has reference semantics issues so we do it manually
 * @param face1
 * @param face2
 */
function edgeSetHas(set: Set<{face1Id:bigint, face2Id:bigint}>, face1:bigint, face2:bigint) {
  for(const edge of set) {
    if ((edge.face1Id === face1 && edge.face2Id === face2) || (edge.face1Id === face2 && edge.face2Id === face1)) {
      return true;
    }
  }

  return false;
}

/**
 * Delete outsideFace -> [ogFaceId] in the adjency list
 * @param outsideFace - the face to look for connections in adj list
 * @param ogFaceId - the face to remove for in list of connections
 * @returns void
 */
function deleteValue(outsideFace:bigint, ogFaceId: bigint) {
  let outsideFacesPairs: EdgesAdjList[] | undefined = adjList.get(outsideFace);
  if (outsideFacesPairs === undefined) {
    throw new Error();
  }
  for(let i = 0; i < outsideFacesPairs.length; i++) {
    if (outsideFacesPairs[i].idOfOtherFace === ogFaceId) {
      // found the outdated value
      adjList.get(outsideFace)?.splice(i, 1);
      return;
    }
  }
}



const idsToFaces : Map<bigint, Face2D> = new Map<bigint, Face2D>();
const adjList : Map<bigint, EdgesAdjList[]> = new Map<bigint, EdgesAdjList[]>();
// this field stores all edges that are created at the same time
// note these "mini edges" that constitute a larger edge
// will dynamically update
const disjointSet: Set<{face1Id:bigint, face2Id:bigint}>[] = [];



/**
 * Traverse the ADJ list, returning a new list containing all faces that are reachable
 * from all of the starting points, traversing via BFS, ignoring edges not to cross
 * @param startingPoints
 * @param edgesNotToCross
 */
export function BFS(startingPoints: bigint[], edgesNotToCross: Set<{face1Id: bigint;face2Id: bigint;}>): Set<bigint> {
  // allFoundLocations
  const retSet: Set<bigint> = new Set<bigint>();

  for(let i = 0; i < startingPoints.length; i++) {
    // do bfs on a start node
    const currentRes: bigint[] = Array.from(singleBfs(startingPoints[i], edgesNotToCross));
    currentRes.forEach(item => retSet.add(item));
  }

  return retSet;
}


/**
 * helper method to see if item is in set
 * don't want to deal with reference semantics in normal has
 * @param edgesSet - the set to check
 * @param f1 = face 1
 * @param f2 - face 2 in edge
 */
function DisJointSetHas(edgesSet: Set<{face1Id: bigint;face2Id: bigint;}>, f1: bigint, f2: bigint): boolean {
  for(const item of edgesSet) {
    if (item.face1Id === f1 && item.face2Id === f2) {
      return true;
    }
    if (item.face1Id === f2 && item.face2Id === f1) {
      return true;
    }
  }

  return false;
}

/**
 * helper method that does bfs from one vertex
 * @param startVertex - the vertex to do bfs from
 * @param edgesNotToCross - list of edges not to cross
 * @returns
 */
function singleBfs(startVertex: bigint, edgesNotToCross: Set<{face1Id: bigint;face2Id: bigint;}>): Set<bigint> {
  const result: Set<bigint> = new Set();
  const visited: Set<bigint> = new Set();
  const queue: bigint[] = [];

  queue.push(startVertex);
  visited.add(startVertex);
  while (queue.length > 0) {
      const currentVertex = queue.shift()!;
      result.add(currentVertex);

      const neighborsRecord = adjList.get(currentVertex) || [];
      const neighbors: bigint[] = [];
      neighborsRecord.forEach(item => neighbors.push(item.idOfOtherFace));
      for (const neighbor of neighbors) {
          // standard bfs given its's a new neighbor and we don't use the edges not to cross
          if (!visited.has(neighbor) &&
          !DisJointSetHas(edgesNotToCross, currentVertex, neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
          }
      }
  }
  return result;
}

/**
 * returns the set of edges that are connected to the provided face1-face2 edge
 * or an error if no connection found
 * @param face1Id
 * @param face2Id
 */
export function getDisjointSetEdge(face1Id: bigint, face2Id: bigint): Set<{face1Id:bigint, face2Id:bigint}> {
  for(const set of disjointSet) {
    if (edgeSetHas(set, face1Id, face2Id)) {
      return set;
    }
  }
  throw new Error("no set found for edge: " +  face1Id +"-" + face2Id);
}


/**
 * returns the set of edges that are connected to the provided face1-face2 edge
 * or an error if no connection found,
 * also deletes from set after found
 * @param face1Id
 * @param face2Id
 */
export function getDisjointSetEdgeAndDelete(face1Id: bigint, face2Id: bigint): Set<{face1Id:bigint, face2Id:bigint}> {

  for(let i = 0; i < disjointSet.length; i++) {
    const set = disjointSet[i];
    if (edgeSetHas(set, face1Id, face2Id)) {
      const cpyOfSet = new Set(set);
      disjointSet.splice(i, 1);
      return cpyOfSet;
    }
  }


  throw new Error("no set found for edge: " +  face1Id +"-" + face2Id);
}


/**
 * Takes an instance of the first old connection anywhere in the disjoint set,
 * removes all of the itesm,
 * and replaces it will all items in new connection
 * @param oldconnection - the old connection
 * @param newconnections - list of new connections that replace the old connection
 */
export function ReplaceExistingConnectionsBasedOnFirstWithNewConnections(
  oldconnection: {aFaceId: bigint, bFaceId: bigint}[],
  newconnections:  {face1Id: bigint, face2Id: bigint}[]
) {


  // goes for every old connection and removes it if found
  // only adds once to every time it finds new connection
  for(const setsOfEdgesInAGroup of disjointSet) {
    // try to delete item and see if it works, if so, add new connections
    let removedOldCon = setsOfEdgesInAGroup.delete({face1Id: oldconnection[0].aFaceId, face2Id: oldconnection[0].bFaceId});
    removedOldCon ||= setsOfEdgesInAGroup.delete({face1Id: oldconnection[0].bFaceId, face2Id: oldconnection[0].aFaceId});

    if (removedOldCon) {
      // remove all other connectsion in my set
      for(let i = 1; i < oldconnection.length; i++) {
        setsOfEdgesInAGroup.delete({face1Id: oldconnection[i].aFaceId, face2Id: oldconnection[i].bFaceId});
        setsOfEdgesInAGroup.delete({face1Id: oldconnection[i].bFaceId, face2Id: oldconnection[i].aFaceId});
      }


      // old connection exists in this set, so add all of the new connections
      for(const newEdge of newconnections) {
        setsOfEdgesInAGroup.add(newEdge);
      }
    }

  }

}

/**
 * Takes an instance of the old connection anywhere in the disjoint set
 * and replaces it will all items in new connection
 * @param oldconnection - the old connection
 * @param newconnections - list of new connections that replace the old connection
 */
export function ReplaceExistingConnectionWithNewConnections(
  oldconnection: {aFaceId: bigint, bFaceId: bigint},
  newconnections:  {face1Id: bigint, face2Id: bigint}[]
) {

  for(const setsOfEdgesInAGroup of disjointSet) {
    // try to delete item and see if it works, if so, add new connections
    let removedOldCon = setsOfEdgesInAGroup.delete({face1Id: oldconnection.aFaceId, face2Id: oldconnection.bFaceId});
    removedOldCon ||= setsOfEdgesInAGroup.delete({face1Id: oldconnection.bFaceId, face2Id: oldconnection.aFaceId});

    if (removedOldCon) {
      // old connection exists in this set, so add all of the new connections
      for(const newEdge of newconnections) {
        setsOfEdgesInAGroup.add(newEdge);
      }
    }


  }


}

/**
 * checks if there is a connection between face 1 -> face 2 in adj list
 * @param faceId1
 * @param faceId2
 * @returns boolean
 */
export function isConnectionInAdjList(faceId1: bigint, faceId2: bigint) {
  const listConnections = adjList.get(faceId1);
  if (listConnections === undefined) {
    return false;
  }

  for (const item of listConnections) {
    if (item.idOfOtherFace === faceId2) {
      return true;
    }
  }

  return false;

}

/**
 * returns the connection between faceid1 -> faceid2
 * from adj list. throws error if not found
 * @param faceId1
 * @param faceId2
 * @returns
 */
export function getConnectionInAdjList(faceId1: bigint, faceId2: bigint) {
  const listConnections = adjList.get(faceId1);
  if (listConnections === undefined) {
    throw new Error("no adj list for faceid:" + faceId1);
  }

  for (const item of listConnections) {
    if (item.idOfOtherFace === faceId2) {
      return item;
    }
  }

  throw new Error("no connection for:" + faceId1 + " -> " + faceId2 + " in adj list");
}



/**
 * takes a set of edges that were created at once and adds it
 * @param newSetOfEdgesForDS - the new set of edges to link together
 */
export function AddNewEdgeToDisjointSet(newSetOfEdgesForDS: Set<{
  face1Id: bigint;
  face2Id: bigint;
}>) {
  disjointSet.push(newSetOfEdgesForDS);
}


/**
 * @returns - the adjcency list of connected faces
 */
export function getAdjList() {
  return adjList;
}




/**
 * Adds an item to the ADJ list, IS NOT DONE IN REVERSE
 * @param faceId - the id of the face for the key value
 * @param otherFaceConnectionDetails - the item to add to the list
 */
export function addValueToAdjList(faceId: bigint, otherFaceConnectionDetails: EdgesAdjList) {
  if (adjList.get(faceId) === undefined) {
    console.log("couldn't find connections for faceId, making one. this is possible iff the face is being split for the first time and there are no other connections");
    adjList.set(faceId, []);
  }

  const value = adjList.get(faceId);
  value.push(otherFaceConnectionDetails);
}

/**
 * Udpate the adjcency list when splitting a face
 * @param ogFaceId - the original face to split
 * @param param1 - a list of the updated left face information, [id, the edge that is being folded, map of points from ogFace to LeftFace]
 * @param param2 - a list of the updated right face information, [id, the edge that is being folded, map of points from ogFace to rightFace]
 * @param angle - the angle between the two faces
 * @param idOfEdgeThatPointSplitsAtInOgFace1 - the edge in my original face that the edge splits, returns pointid if not on edge
 * @param idOfEdgeThatPointSplitsAtInOgFace2 - the other edge in my original face that the edge splits, returns pointid if not on edge
 */
export function updateAdjListForSplitGraph(
  leftFaceObj:Face2D, rightFaceObj:Face2D, ogFaceId: bigint,
  [leftFaceId, leftFaceEdgeIdThatFolds, ogPointIdsToLeftPointIds]: [bigint, bigint, Map<bigint, bigint>],
  [rightFaceId, rightFaceEdgeIdThatFolds, ogPoingIdsToRightPointIds]: [bigint, bigint, Map<bigint, bigint>],
  angle: bigint, idOfEdgeThatPointSplitsAtInOgFace1: bigint, idOfEdgeThatPointSplitsAtInOgFace2: bigint
) {

  // multifold update: here is the list (should be max of size 2) of the
  // problem edges to return to

  // multifold update: you'll have to record
                    // both this id of our trouble face, the ids of A_1, A_2 that need to be hooked
                    // and the OG id of the outside connection (B)
  const problemEdgesToReturnTo: ProblemEdgeInfo[] = [];
  // create new list, since we are making new planes
  adjList.set(leftFaceId, []);
  adjList.set(rightFaceId, []);

  const correctLeftFaceEdge: bigint =  leftFaceEdgeIdThatFolds;
  const correctRightFaceEdge:  bigint = rightFaceEdgeIdThatFolds;


  if (adjList.size === 1) {
    // this is the first fold ever

    const value: EdgesAdjList = {
      idOfOtherFace: rightFaceId,
      angleBetweenThem: angle,
      edgeIdOfMyFace: correctLeftFaceEdge,
      edgeIdOfOtherFace: correctRightFaceEdge
    }
    adjList.get(leftFaceId)?.push(value);

    const value2: EdgesAdjList = {
      idOfOtherFace: leftFaceId,
      angleBetweenThem: angle,
      edgeIdOfMyFace: correctRightFaceEdge,
      edgeIdOfOtherFace: correctLeftFaceEdge
    }
    adjList.get(rightFaceId)?.push(value2);
  } else {
    // there have been folds before, so we need update the list parameters
    // first we create the new items for our list

    // inner L-R connection
    const value: EdgesAdjList = {
      idOfOtherFace: rightFaceId,
      angleBetweenThem: angle,
      edgeIdOfMyFace: correctLeftFaceEdge,
      edgeIdOfOtherFace: correctRightFaceEdge
    }
    adjList.get(leftFaceId)?.push(value);

    const value2: EdgesAdjList = {
      idOfOtherFace: leftFaceId,
      angleBetweenThem: angle,
      edgeIdOfMyFace: correctRightFaceEdge,
      edgeIdOfOtherFace: correctLeftFaceEdge
    }
    adjList.get(rightFaceId)?.push(value2);


    // now we update any connection to our old id using the old adj list
    // and add these to the new fold objects
    let allOldConnectionsThatNeedToBeUdpdated: EdgesAdjList[] | undefined = adjList.get(ogFaceId);
    if (allOldConnectionsThatNeedToBeUdpdated === undefined) {
      throw new Error("OUTDATED ADJ LIST; don't have og face");
    }


    // delete the copy from the other faces
    // basically C -> A (where A is the face im splitting)
    for (let i = 0; i < allOldConnectionsThatNeedToBeUdpdated.length; i++) {
      const currentItem = allOldConnectionsThatNeedToBeUdpdated[i];
      const outsideFaceToUpdate = currentItem.idOfOtherFace;

      if(!(currentItem.edgeIdOfMyFace === idOfEdgeThatPointSplitsAtInOgFace1 ||
        currentItem.edgeIdOfMyFace === idOfEdgeThatPointSplitsAtInOgFace2)) {
        deleteValue(outsideFaceToUpdate, ogFaceId);
      } else {
        console.log("saved item");
      }
    }




    // create the copy list, and add the copy to the other faces
    // this is all the outside stuff connecting back to the L/R split
    // i need to be careful here not to include any edges that
    // cause a split down the middle, and instead return it
    for (let i = 0; i < allOldConnectionsThatNeedToBeUdpdated.length; i++) {
      const currentItem = allOldConnectionsThatNeedToBeUdpdated[i];
      const theOldEdgeIdOfMyFace = currentItem.edgeIdOfMyFace;

      // updated for multifold:
      // I should only do the basic fold IF THE CONNECTION THAT I AM DOING
      // IS NOT SPLITTING UP THE EDGE OF THE ORIGINAL FACE
      // note this doesn't pick up middle edges that split A_1 A_2
      // where the edge is touching the outside, since that wouldn't be in our graph
      // since we need another outside face to be in this loop bc it's an adj list
      if(theOldEdgeIdOfMyFace === idOfEdgeThatPointSplitsAtInOgFace1 ||
         theOldEdgeIdOfMyFace === idOfEdgeThatPointSplitsAtInOgFace2) {
          // bak
          manuallyFindTheConnectionBetweenTheSplitFace(getFace2dFromId(ogFaceId), leftFaceObj, rightFaceObj,
            theOldEdgeIdOfMyFace, problemEdgesToReturnTo, currentItem
          );

          // // safety check that there is a mapping between A-> A1 and A -> A2
          // if (ogPointIdsToLeftPointIds.get(theOldEdgeIdOfMyFace) === undefined ||
          //     ogPoingIdsToRightPointIds.get(theOldEdgeIdOfMyFace) === undefined) {
          //       throw new Error("NO MAPPING FROM A->A_1/A_2 Edges");
          // }

          // // multifold update: you'll have to record
          // // both this id of our trouble face, the ids of A_1, A_2 that need to be hooked
          // // and the OG id of the outside connection (B)
          // problemEdgesToReturnTo.push({
          //   sideA: {
          //     faceIdOfMyFaceA: ogFaceId,
          //     edgeIdOfMyFaceA: theOldEdgeIdOfMyFace,
          //     faceIdOfMyFaceA1: leftFaceId,
          //     edgeIdOfMyFaceA1: ogPointIdsToLeftPointIds.get(theOldEdgeIdOfMyFace), // idea here is to get the edge of A1, since vertex and edges correspond
          //     faceIdOfMyFaceA2: rightFaceId,
          //     edgeIdOfMyFaceA2: ogPoingIdsToRightPointIds.get(theOldEdgeIdOfMyFace)
          //   },
          //   sideB: {
          //     faceIdOfMyFaceB: currentItem.idOfOtherFace,
          //     edgeIdOfMyFaceB: currentItem.edgeIdOfOtherFace
          //   }

          // });
          continue;
      }



      // find out where the old edge when to
      if (Array.from(ogPointIdsToLeftPointIds.keys()).includes(theOldEdgeIdOfMyFace) &&
      Array.from(ogPointIdsToLeftPointIds.keys()).includes((theOldEdgeIdOfMyFace + 1n) % getFace2dFromId(ogFaceId).N)) {
        // left face has the connection
        const theEdgeForTheSplitFace: bigint | undefined = ogPointIdsToLeftPointIds.get(theOldEdgeIdOfMyFace);
        if (theEdgeForTheSplitFace === undefined) {
          throw new Error("missed edge in adj list");
        }

        // create the new value for the left face
        const valueForNewFace: EdgesAdjList = {
          idOfOtherFace: currentItem.idOfOtherFace,
          angleBetweenThem: currentItem.angleBetweenThem,
          edgeIdOfMyFace: theEdgeForTheSplitFace,
          edgeIdOfOtherFace: currentItem.edgeIdOfOtherFace
        }

        adjList.get(leftFaceId)?.push(valueForNewFace);

        // creat the update value for the outside connection
        const valueForTheOutsideValue: EdgesAdjList = {
          idOfOtherFace: leftFaceId,
          angleBetweenThem: currentItem.angleBetweenThem,
          edgeIdOfMyFace: currentItem.edgeIdOfOtherFace,
          edgeIdOfOtherFace: theEdgeForTheSplitFace
        }

        adjList.get(currentItem.idOfOtherFace)?.push(valueForTheOutsideValue);
        // also update connection for DS
        ReplaceExistingConnectionWithNewConnections(
          {aFaceId:ogFaceId , bFaceId:currentItem.idOfOtherFace}, // old
          [{face1Id:leftFaceId , face2Id:currentItem.idOfOtherFace}]  // new swap a1 for a
        );
      } else if (Array.from(ogPoingIdsToRightPointIds.keys()).includes(theOldEdgeIdOfMyFace) &&
        Array.from(ogPoingIdsToRightPointIds.keys()).includes((theOldEdgeIdOfMyFace + 1n) % getFace2dFromId(ogFaceId).N)) {
        // right face has the connection
        const theEdgeForTheSplitFace: bigint | undefined = ogPoingIdsToRightPointIds.get(theOldEdgeIdOfMyFace);
        if (theEdgeForTheSplitFace === undefined) {
          throw new Error("missed edge in adj list");
        }

        // create the new value for the right face
        const valueForNewFace: EdgesAdjList = {
          idOfOtherFace: currentItem.idOfOtherFace,
          angleBetweenThem: currentItem.angleBetweenThem,
          edgeIdOfMyFace: theEdgeForTheSplitFace,
          edgeIdOfOtherFace: currentItem.edgeIdOfOtherFace
        }

        adjList.get(rightFaceId)?.push(valueForNewFace);

        // creat the update value for the outside connection
        const valueForTheOutsideValue: EdgesAdjList = {
          idOfOtherFace: rightFaceId,
          angleBetweenThem: currentItem.angleBetweenThem,
          edgeIdOfMyFace: currentItem.edgeIdOfOtherFace,
          edgeIdOfOtherFace: theEdgeForTheSplitFace
        }

        adjList.get(currentItem.idOfOtherFace)?.push(valueForTheOutsideValue);
        // also update connection for DS
        ReplaceExistingConnectionWithNewConnections(
          {aFaceId:ogFaceId , bFaceId:currentItem.idOfOtherFace}, // old
          [{face1Id:rightFaceId , face2Id:currentItem.idOfOtherFace}]  // new swap a1 for a
        );
      } else {
        throw new Error("one should have happened, saying there is an old connection from A to outside face, but A1 A2 don't have the old edge mapped to either one");
      }
    }


    // delete the old face adj list
    adjList.delete(ogFaceId);
  }


  return problemEdgesToReturnTo;
}

/**
 * return if the two points are close together (at the same point in space)
 * @param p1
 * @param p2
 * @returns
 */
function pseudoEquals(p1: Point2D, p2: Point2D) {
  return distance(p1, p2) < 0.01;
}

/**
 * returns the edge ids if the two faces share an edge
 * @param leftChildObj
 * @param rightChildObj
 * @returns
 */
function getEdgeThatSharesBetweenTheTwoFaces(leftChildObj: Face2D, rightChildObj: Face2D) {
  for(let i = 0; i < leftChildObj.N; i++) {
    // for every pair in the left child
    const leftPtInLeftChildIndex: bigint = BigInt(i);
    const leftPtInLeftChild = leftChildObj.vertices[Number(leftPtInLeftChildIndex)];
    const rightPtInLeftChildIndex: bigint = BigInt(i + 1) % leftChildObj.N;
    const rightPtInLeftChild = leftChildObj.vertices[Number(rightPtInLeftChildIndex)];


    for(let j = 0; j < rightChildObj.N; j++) {
    // for every pair in the right child
    const leftPtInRightChildIndex: bigint = BigInt(j);
    const leftPtInRightChild = rightChildObj.vertices[Number(leftPtInRightChildIndex)];
    const rightPtInRightChildIndex: bigint = BigInt(j + 1) % rightChildObj.N;
    const rightPtInRightChild = rightChildObj.vertices[Number(rightPtInRightChildIndex)];

      if (pseudoEquals(leftPtInLeftChild, leftPtInRightChild) && pseudoEquals(rightPtInLeftChild, rightPtInRightChild)) {
        // left-left and right-right match
        return {pt1:{l:leftPtInLeftChildIndex, r:leftPtInRightChildIndex}, pt2:{l:rightPtInLeftChildIndex, r:rightPtInRightChildIndex}}
      }
      else if (pseudoEquals(leftPtInLeftChild, rightPtInRightChild) && pseudoEquals(rightPtInLeftChild, leftPtInRightChild)) {
        // left-right and right-left match
        return {pt1:{l:leftPtInLeftChildIndex, r:rightPtInRightChildIndex}, pt2:{l:rightPtInLeftChildIndex, r:leftPtInRightChildIndex}}
      }
    }

  }

  throw new Error("couldn't find matchup");
}

/**
 * goal is to return the other vertex id that isn't apart of the fold
 * ie connected to firstPointIdOfCut that is adjacent, but not equal to secondPointIdOFCut
 * @param faceObj
 * @param firstPointIdOfCut
 * @param secondPointIdOfCut
 */
function returnNoCutEdgeVertex(faceObj: Face2D, firstPointIdOfCut: bigint, secondPointIdOfCut:bigint) {
  if ((firstPointIdOfCut + 1n) % faceObj.N !== secondPointIdOfCut) {
    // going forwad/positive is the way away
    return (firstPointIdOfCut + 1n) % faceObj.N;
  }

  // going backwards is correct (deal with looping, so do size - 1)
  return (firstPointIdOfCut + (faceObj.N - 1n)) % faceObj.N;
}

/**
 * returns in the format of Face1id-Face2id
 * @param face1
 * @param param1
 * @param face2
 * @param param3
 */
function mergeTheTwoEdgesTogether(face1: Face2D, [edge1V1, edge1V2]: [bigint, bigint], face2: Face2D, [edge2V1, edge2V2]: [bigint, bigint]): [bigint, bigint] {
  // we need to see if edge1V1=edge2V1 or edge1V1=edge2V2
  if (pseudoEquals(face1.getPoint(edge1V1), face2.getPoint(edge2V2))) {
    return [edge1V2, edge2V1];
  }

  // edge1V1=edge2V1
  if (pseudoEquals(face1.getPoint(edge1V1), face2.getPoint(edge2V1))) {
    return [edge1V2, edge2V2];
  }



  // we need to see if edge1V2=edge1V1 or edge1V2=edge1V2

  // edge1V2=edge1V1
  if (pseudoEquals(face1.getPoint(edge1V2), face2.getPoint(edge2V2))) {
    return [edge1V1, edge2V1];
  }

  // edge1V2=edge1V1
  if (pseudoEquals(face1.getPoint(edge1V2), face2.getPoint(edge2V1))) {
    return [edge1V1, edge2V2];
  }


  throw new Error("no matching")
}

/**
 * finds the connection between an original face, and the edges childs
 * @param ogFaceObj
 * @param leftChildObj
 * @param rightChildObj
 * @param edgeIdThatsTroubleInOg - the edges of the original face that are split
 * @param problemEdgesToReturnTo - the edges of the child object that are connected
 * @param currentItem - the current list to list the current edges
 * @returns
 */
function manuallyFindTheConnectionBetweenTheSplitFace(ogFaceObj: Face2D, leftChildObj: Face2D, rightChildObj: Face2D, edgeIdThatsTroubleInOg:bigint, problemEdgesToReturnTo: ProblemEdgeInfo[], currentItem: EdgesAdjList) {

  const faceEdgePoint1 = ogFaceObj.getPoint(edgeIdThatsTroubleInOg);
  const faceEdgePoint2 = ogFaceObj.getPoint((edgeIdThatsTroubleInOg + 1n) % ogFaceObj.N);


  // first we need to find the edge that intersects the left and right child
  const actualSplit = getEdgeThatSharesBetweenTheTwoFaces(leftChildObj, rightChildObj);

  // to find the connection for the pt1 left face

  // these two pair
  const firstPointOtherLeftId = returnNoCutEdgeVertex(leftChildObj, actualSplit.pt1.l, actualSplit.pt2.l);
  const firstLefttEdge: [bigint, bigint] = [firstPointOtherLeftId, actualSplit.pt1.l];

  const firstPointOtherRightId = returnNoCutEdgeVertex(rightChildObj, actualSplit.pt1.r, actualSplit.pt2.r);
  const firstRightEdge: [bigint, bigint] = [firstPointOtherRightId, actualSplit.pt1.r];

  // edge that is pseudo equal to the merged edge of A
  const mergedEdgeOne: [bigint, bigint] = mergeTheTwoEdgesTogether(leftChildObj, firstLefttEdge, rightChildObj, firstRightEdge);

  let isTrue1 = (pseudoEquals(leftChildObj.getPoint(mergedEdgeOne[0]), faceEdgePoint1) &&
  pseudoEquals(rightChildObj.getPoint(mergedEdgeOne[1]), faceEdgePoint2));
  isTrue1 ||=  (pseudoEquals(leftChildObj.getPoint(mergedEdgeOne[0]), faceEdgePoint2) &&
  pseudoEquals(rightChildObj.getPoint(mergedEdgeOne[1]), faceEdgePoint1));
  if (isTrue1) {
    problemEdgesToReturnTo.push({
      sideA: {
        faceIdOfMyFaceA: ogFaceObj.ID,
        edgeIdOfMyFaceA: edgeIdThatsTroubleInOg,
        faceIdOfMyFaceA1: leftChildObj.ID,
        edgeIdOfMyFaceA1: startOfEdge(leftChildObj, firstLefttEdge), // todo: get either [0], [1] // idea here is to get the edge of A1, since vertex and edges correspond
        faceIdOfMyFaceA2: rightChildObj.ID,
        edgeIdOfMyFaceA2: startOfEdge(rightChildObj, firstRightEdge) // todo: get either [0], [1]
      },
      sideB: {
        faceIdOfMyFaceB: currentItem.idOfOtherFace,
        edgeIdOfMyFaceB: currentItem.edgeIdOfOtherFace
      }

    });
    return;
  }

  // then the target must be the other connection



  // these two pair
  const secondPointOtherLeftId = returnNoCutEdgeVertex(leftChildObj, actualSplit.pt2.l, actualSplit.pt1.l);
  const secondLefttEdge: [bigint, bigint] = [secondPointOtherLeftId, actualSplit.pt2.l];

  const secondPointOtherRightId = returnNoCutEdgeVertex(rightChildObj, actualSplit.pt2.r, actualSplit.pt1.r);
  const secondRightEdge: [bigint, bigint] = [secondPointOtherRightId, actualSplit.pt2.r];


  // edge that is pseudo equal to the merged edge of B
  const mergedEdgeTwo: [bigint, bigint] = mergeTheTwoEdgesTogether(leftChildObj, secondLefttEdge, rightChildObj, secondRightEdge);

  let isTrue2 = (pseudoEquals(leftChildObj.getPoint(mergedEdgeTwo[0]), faceEdgePoint1) &&
  pseudoEquals(rightChildObj.getPoint(mergedEdgeTwo[1]), faceEdgePoint2));
  isTrue2 ||= (pseudoEquals(leftChildObj.getPoint(mergedEdgeTwo[0]), faceEdgePoint2) &&
  pseudoEquals(rightChildObj.getPoint(mergedEdgeTwo[1]), faceEdgePoint1))

  if (isTrue2) {
    problemEdgesToReturnTo.push({
      sideA: {
        faceIdOfMyFaceA: ogFaceObj.ID,
        edgeIdOfMyFaceA: edgeIdThatsTroubleInOg,
        faceIdOfMyFaceA1: leftChildObj.ID,
        edgeIdOfMyFaceA1: startOfEdge(leftChildObj, secondLefttEdge), // todo: get either [0], [1] // idea here is to get the edge of A1, since vertex and edges correspond
        faceIdOfMyFaceA2: rightChildObj.ID,
        edgeIdOfMyFaceA2: startOfEdge(rightChildObj, secondRightEdge) // todo: get either [0], [1]
      },
      sideB: {
        faceIdOfMyFaceB: currentItem.idOfOtherFace,
        edgeIdOfMyFaceB: currentItem.edgeIdOfOtherFace
      }

    });
    return;
  }

  throw new Error("missed overlap");
}


/**
 * given two ids of an edge on a face (two connected vertex ids), return the "pointing"
 * id direction
 * @param faceObj
 * @param edgeObjPair
 * @returns
 */
function startOfEdge(faceObj: Face2D, edgeObjPair: [bigint, bigint]) {
  if (edgeObjPair[0] === edgeObjPair[1]) {
    throw new Error('need adj');
  }
  // edge case: zero vector isn't always min
  if (edgeObjPair[0] === 0n || edgeObjPair[1] === 0n) {
    if(edgeObjPair[0] === 1n || edgeObjPair[1] === 1n) {
      return 0n;
    }

    return faceObj.N - 1n;
  }


  if(edgeObjPair[0] < edgeObjPair[1]) {
    return edgeObjPair[0];
  }

  return edgeObjPair[1];
}


/**
 * Udpate the adjcency list when merging a face,
 * does everything, but update the problem edges
 * returns it in the list format of the children connection
 * example [a1, b1], [a2, b2]
 * will be duplicated request
 * @param mergedFaceId - the id of the new merged face
 * @param firstFaceId - the id of the first face that's merged
 * @param secondFaceId  - the id of the second face that's merged
 * @param problemFacesICantUdpateYet list of all faces id you can't add yet. this are your a1 a2 b1 b2 faces in your DS edge
 * @param mapFromFirstFaceEdgeIdsToMergedEdges - a map of point ids in the left face that map to the merged face
 * @param mapFromSecondFaceEdgeIdsToMergedEdges - a map of point ids in the right face that map to the merged face
 */
export function updateAdjListForMergeGraph(
  mergedFaceId: bigint,
  firstFaceId: bigint,
  secondFaceId: bigint,
  problemFacesICantUdpateYet: bigint[],
  mapFromFirstFaceEdgeIdsToMergedEdges: Map<bigint, bigint>,
  mapFromSecondFaceEdgeIdsToMergedEdges: Map<bigint, bigint>
) {
  const problemEdgesToReturnTo: EdgesAdjListMerging[] = [];




    // create new list, since we are making new planes
    adjList.set(mergedFaceId, []);

    // we need to update the list parameters of our new faces (ones that are attached to first/second)
    // then we do the others after
    const firstFaceConnections: EdgesAdjList[] | undefined = adjList.get(firstFaceId);
    if(firstFaceConnections === undefined) {
      throw new Error("missing adj storage");
    }

    // add udpate items for my mergedface -> list for the firstFace for INDEPENDENT FACES
    for(const item of firstFaceConnections) {
      // dont connect if it's my connected face from merge line
      // OR any other face from my edge
      if (item.idOfOtherFace !== secondFaceId && !problemFacesICantUdpateYet.includes(item.idOfOtherFace)) {
        const updatedEdge: bigint | undefined = mapFromFirstFaceEdgeIdsToMergedEdges.get(item.edgeIdOfMyFace);
        if (updatedEdge === undefined) {
          throw new Error();
        }
        const myFaceUpdatedValues: EdgesAdjList = {
          idOfOtherFace: item.idOfOtherFace,
          angleBetweenThem: item.angleBetweenThem,
          edgeIdOfOtherFace: item.edgeIdOfOtherFace,
          edgeIdOfMyFace: updatedEdge
        };

        // we know this exists from very top of method, so ? syntax is ok
        adjList.get(mergedFaceId)?.push(myFaceUpdatedValues);
        // also update connection for DS
        ReplaceExistingConnectionWithNewConnections(
          {aFaceId:firstFaceId , bFaceId:item.idOfOtherFace}, // old
          [{face1Id:mergedFaceId , face2Id:item.idOfOtherFace}]  // new swap a1 for a
        ); // todo, update for face 2 (and also twice for split, one for each face)
      } else if (item.idOfOtherFace !== secondFaceId && problemFacesICantUdpateYet.includes(item.idOfOtherFace)) {
        // this is the face where we have a match with problem edge
        // we'll make a note of storing a1 -> b1
        // meaning by the end well have a1 (a) -> b1 (b)
        //                              b1 (b) -> a1 (a)
        //                              a2 (a) -> b2 (b)
        //                              b2 (b) -> a2 (a)
        // but just be on the lookout for this
        const pairing = findValueBasedOnIds(firstFaceId, item.idOfOtherFace)
        problemEdgesToReturnTo.push({
          idOfMyFace: firstFaceId,
          idOfOtherFace: pairing.idOfOtherFace,
          edgeIdOfMyFace: pairing.edgeIdOfMyFace,
          edgeIdOfOtherFace: pairing.edgeIdOfOtherFace,
          angleBetweenThem: pairing.angleBetweenThem
        });
      }
    }

    const secondFaceConnections: EdgesAdjList[] | undefined = adjList.get(secondFaceId);
    if(secondFaceConnections === undefined) {
      throw new Error("missing adj storage");
    }

    // add udpate items for my mergedface -> list for the second Face
    for(const item of secondFaceConnections) {
      if (item.idOfOtherFace !== firstFaceId && !problemFacesICantUdpateYet.includes(item.idOfOtherFace)) {
        const updatedEdge: bigint | undefined = mapFromSecondFaceEdgeIdsToMergedEdges.get(item.edgeIdOfMyFace);
        if (updatedEdge === undefined) {
          throw new Error();
        }
        const myFaceUpdatedValues: EdgesAdjList = {
          idOfOtherFace: item.idOfOtherFace,
          angleBetweenThem: item.angleBetweenThem,
          edgeIdOfOtherFace: item.edgeIdOfOtherFace,
          edgeIdOfMyFace: updatedEdge
        };

        // we know this exists from very top of method, so ? syntax is ok
        adjList.get(mergedFaceId)?.push(myFaceUpdatedValues);
        // also update connection for DS
        ReplaceExistingConnectionWithNewConnections(
          {aFaceId:secondFaceId , bFaceId:item.idOfOtherFace}, // old
          [{face1Id:mergedFaceId , face2Id:item.idOfOtherFace}]  // new swap a1 for a
        );
      } else if (item.idOfOtherFace !== firstFaceId && problemFacesICantUdpateYet.includes(item.idOfOtherFace)) {
        // this is the face where we have a match with problem edge
        // we'll make a note of storing a1 -> b1
        // meaning by the end well have a1 (a) -> b1 (b)
        //                              b1 (b) -> a1 (a)
        //                              a2 (a) -> b2 (b)
        //                              b2 (b) -> a2 (a)
        // but just be on the lookout for this

        const pairing = findValueBasedOnIds(secondFaceId, item.idOfOtherFace)
        problemEdgesToReturnTo.push({
          idOfMyFace: firstFaceId,
          idOfOtherFace: pairing.idOfOtherFace,
          edgeIdOfMyFace: pairing.edgeIdOfMyFace,
          edgeIdOfOtherFace: pairing.edgeIdOfOtherFace,
          angleBetweenThem: pairing.angleBetweenThem
        });
      }
    }

    // now we need to update all of the other faces that have our oudated version
    // again DO NOT UPDATE THE PROBLEM EDGE
    // a1 b1 (since b face doesn't exist yet)
    // other connections -> [.., new merged face, ...]
    // now we update any connection to our old id using the old adj list
    // and add these to the new fold objects
    // for the first face
    let allOldConnectionsThatNeedToBeUdpdated: EdgesAdjList[] | undefined = adjList.get(firstFaceId);
    if (allOldConnectionsThatNeedToBeUdpdated === undefined) {
      throw new Error("OUTDATED ADJ LIST");
    }

    // delete the copy from the other faces
    for (let i = 0; i < allOldConnectionsThatNeedToBeUdpdated.length; i++) {
      const currentItem = allOldConnectionsThatNeedToBeUdpdated[i];
      if (currentItem.idOfOtherFace !== secondFaceId) {
        const outsideFaceToUpdate = currentItem.idOfOtherFace;
        // deletes the outsideFace -> firstFace kv pair
        deleteValue(outsideFaceToUpdate, firstFaceId);
      }
    }

    // now we add the update values back in
    for (let i = 0; i < allOldConnectionsThatNeedToBeUdpdated.length; i++) {
      const currentItem = allOldConnectionsThatNeedToBeUdpdated[i];
      // only update put outside connection, no a1 b1
      if (currentItem.idOfOtherFace !== secondFaceId && !problemFacesICantUdpateYet.includes(currentItem.idOfOtherFace)) {
        const outsideFaceToUpdate = currentItem.idOfOtherFace;
        // deletes the outsideFace -> firstFace kv pair
        const outsideFaceUpdatedValues: EdgesAdjList = {
          idOfOtherFace: currentItem.idOfOtherFace,
          angleBetweenThem: currentItem.angleBetweenThem,
          edgeIdOfOtherFace: currentItem.edgeIdOfMyFace,
          edgeIdOfMyFace: currentItem.edgeIdOfOtherFace
        };

        adjList.get(outsideFaceToUpdate)?.push(outsideFaceUpdatedValues);
      }
    }

    // now we delete the firstFace adj list pair
    adjList.delete(firstFaceId);



    // repeat for second face
    let allOldConnectionsThatNeedToBeUdpdated2: EdgesAdjList[] | undefined = adjList.get(secondFaceId);
    if (allOldConnectionsThatNeedToBeUdpdated2 === undefined) {
      throw new Error("OUTDATED ADJ LIST");
    }

    // delete the copy from the other faces
    for (let i = 0; i < allOldConnectionsThatNeedToBeUdpdated2.length; i++) {
      const currentItem = allOldConnectionsThatNeedToBeUdpdated2[i];
      if (currentItem.idOfOtherFace !== firstFaceId) {
        const outsideFaceToUpdate = currentItem.idOfOtherFace;
        // deletes the outsideFace -> firstFace kv pair
        deleteValue(outsideFaceToUpdate, secondFaceId);
      }
    }

    // now we add the update values back in
    for (let i = 0; i < allOldConnectionsThatNeedToBeUdpdated2.length; i++) {
      const currentItem = allOldConnectionsThatNeedToBeUdpdated2[i];
      if (currentItem.idOfOtherFace !== firstFaceId && !problemFacesICantUdpateYet.includes(currentItem.idOfOtherFace)) {
        const outsideFaceToUpdate = currentItem.idOfOtherFace;
        // deletes the outsideFace -> firstFace kv pair
        const outsideFaceUpdatedValues: EdgesAdjList = {
          idOfOtherFace: currentItem.idOfOtherFace,
          angleBetweenThem: currentItem.angleBetweenThem,
          edgeIdOfOtherFace: currentItem.edgeIdOfMyFace,
          edgeIdOfMyFace: currentItem.edgeIdOfOtherFace
        };

        adjList.get(outsideFaceToUpdate)?.push(outsideFaceUpdatedValues);
      }
    }

    // now we delete the firstFace adj list pair
    adjList.delete(secondFaceId);


    return problemEdgesToReturnTo;
  }



/**
 * Given two faces that are connected, update the angle between them
 * @param faceId1 - the first face that you want to update the angle of
 * @param faceId2 - the second face that you want to update the angle of
 * @param relativeChange - the new relative angle between them
 */
export function updateRelativePositionBetweenFacesIndependentOfRelativeChange(faceId1: bigint, faceId2: bigint, relativeChange: bigint) {
  let theEdgeIdOfFoldInFaceId1 = -1n;
  let theEdgeIdOfFoldInFaceId2 = -1n;

  const lookingAtFace1Connections = adjList.get(faceId1);
  if (lookingAtFace1Connections === undefined) {
    throw new Error();
  }

  for(let i = 0; i < lookingAtFace1Connections.length; i++) {
    if (lookingAtFace1Connections[i].idOfOtherFace === faceId2) {
      // found the outdated value
      const updatedAngles: EdgesAdjList = {
        idOfOtherFace: lookingAtFace1Connections[i].idOfOtherFace,
        angleBetweenThem: lookingAtFace1Connections[i].angleBetweenThem + relativeChange,
        edgeIdOfMyFace: lookingAtFace1Connections[i].edgeIdOfMyFace,
        edgeIdOfOtherFace: lookingAtFace1Connections[i].edgeIdOfOtherFace
      }
      adjList.get(faceId1)?.splice(i, 1);
      adjList.get(faceId1)?.push(updatedAngles);

      theEdgeIdOfFoldInFaceId1 = updatedAngles.edgeIdOfMyFace;
      break;
    }
  }


  const lookingAtFace2Connections = adjList.get(faceId2);
  if (lookingAtFace2Connections === undefined) {
    throw new Error();
  }

  for(let i = 0; i < lookingAtFace2Connections.length; i++) {
    if (lookingAtFace2Connections[i].idOfOtherFace === faceId1) {
      // found the outdated value
      const updatedAngles: EdgesAdjList = {
        idOfOtherFace: lookingAtFace2Connections[i].idOfOtherFace,
        angleBetweenThem: lookingAtFace2Connections[i].angleBetweenThem + relativeChange,
        edgeIdOfMyFace: lookingAtFace2Connections[i].edgeIdOfMyFace,
        edgeIdOfOtherFace: lookingAtFace2Connections[i].edgeIdOfOtherFace
      }
      adjList.get(faceId2)?.splice(i, 1);
      adjList.get(faceId2)?.push(updatedAngles);
      theEdgeIdOfFoldInFaceId2 = updatedAngles.edgeIdOfMyFace;
      break;
    }
  }

  return [theEdgeIdOfFoldInFaceId1, theEdgeIdOfFoldInFaceId2];

}



/**
 * Returns a specified element from the id<->F2d mappnig. If the value that is associated
 * to the provided key is an existing id, the corresponding Face2D will be returned.
 * then you will get a reference to that object and any
 * change made to that object will effectively modify it inside the Map.
 * @param faceId - the id of the face2d you want
 * @returns  Returns the element associated with the specified key.
 * If no element is associated with the specified id, undefined is returned.
 */
export function getFace2dFromId(faceId : bigint) {
  return idsToFaces.get(faceId);
}

/**
 * Creates a new graph on 2d side, mainly should be used when starting editor
 */
export function createNewGraph(startingPlaneId: bigint) {
  idsToFaces.clear();



  idsToFaces.set(startingPlaneId, new Face2D(
    [
      createPoint2D(-3, -3),
      createPoint2D(-3, 3),
      createPoint2D(3,  3),
      createPoint2D(3, -3),
    ]
  )); // big face
  adjList.set(startingPlaneId, []);

}


/**
 * @returns MapIterator<bigint> of all avaiable faces id
 */
export function getAllFaceIds() {
  return idsToFaces.keys();
}

/**
 * Adds the new face2D object to the mapping of ids to faces
 * @param face2d - the new Face object to add
 */
export function add2dFaceToPaperGraph(face2d: Face2D) {
  idsToFaces.set(face2d.ID, face2d);
}

/**
 * Deletes the mapping of faceId  -> FaceObj
 * @param faceId - the id of the face you want to remove from the mapping
 */
export function delete2dFaceToPaperGraph(faceId: bigint) {
  idsToFaces.delete(faceId);
}

/**
 * Prints out a state of the 2d graph. useful for debugging
 */
export function print2dGraph() {
  console.log("------Display 2d Graph---------");
  console.log(idsToFaces);
  for(const [faceId, faceObj] of idsToFaces) {
    console.log("  ", faceId, ":");
    console.log("  anno points size", faceObj.getAnnotatedPointMap().size);
    for( const [pointId, pointObj] of faceObj.getAnnotatedPointMap()) {
      console.log("     ", pointId);
    }
    console.log("  anno line size", faceObj.getAnnotatedLinesMap().size);
  }


  console.log("-------------------------------");
}

/**
 * Prints out the state of the adjancency list, useful for debugging
 */
export function printAdjList() {
  console.log(Array.from(adjList.entries()));
}


/**
 * returns the connection between the two faces
 * @param faceId1
 * @param faceId2
 * @returns
 */
export function findValueBasedOnIds(faceId1: bigint, faceId2: bigint) {
  const valueList = adjList.get(faceId1);
  if (valueList === undefined) {
    throw new Error();
  }


  for(const itemPair of valueList) {
    if (itemPair.angleBetweenThem === faceId2) {
      return itemPair;
    }
  }

}