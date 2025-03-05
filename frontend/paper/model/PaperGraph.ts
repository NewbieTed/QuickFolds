/**
 * @fileoverview This file is an implementation of a graph of 2DFace objects
 * with public methods to manipulate the graph at a basic level.
 */

import { Face2D } from "../geometry/Face2D.js";
import { createPoint2D } from "../geometry/Point.js";
import { ProblemEdgeInfo } from "./PaperManager.js";

/**
 * stores the values of the adjacency list when doing folds
 */
export type EdgesAdjList = {
    readonly idOfOtherFace: bigint;
    readonly angleBetweenThem: bigint;
    readonly edgeIdOfMyFace: bigint;
    readonly edgeIdOfOtherFace: bigint;
}




const idsToFaces : Map<bigint, Face2D> = new Map<bigint, Face2D>();
const adjList : Map<bigint, EdgesAdjList[]> = new Map<bigint, EdgesAdjList[]>();
// this field stores all edges that are created at the same time
// note these "mini edges" that constitute a larger edge
// will dynamically update
const disjointSet: Set<{face1Id:bigint, face2Id:bigint}>[] = [];

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
 * @param idOfEdgeThatPointSplitsAtInOgFace1 - the other edge in my original face that the edge splits, returns pointid if not on edge
 */
export function updateAdjListForSplitGraph( // bak; if map of points includes vertex we're chillin
  ogFaceId: bigint,
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

      deleteValue(outsideFaceToUpdate, ogFaceId);
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

          // safety check that there is a mapping between A-> A1 and A -> A2
          if (ogPointIdsToLeftPointIds.get(theOldEdgeIdOfMyFace) === undefined ||
              ogPoingIdsToRightPointIds.get(theOldEdgeIdOfMyFace) === undefined) {
                throw new Error("NO MAPPING FROM A->A_1/A_2 Edges");
          }

          // multifold update: you'll have to record
          // both this id of our trouble face, the ids of A_1, A_2 that need to be hooked
          // and the OG id of the outside connection (B)
          problemEdgesToReturnTo.push({
            sideA: {
              faceIdOfMyFaceA: ogFaceId,
              edgeIdOfMyFaceA: theOldEdgeIdOfMyFace,
              faceIdOfMyFaceA1: leftFaceId,
              edgeIdOfMyFaceA1: ogPointIdsToLeftPointIds.get(theOldEdgeIdOfMyFace), // idea here is to get the edge of A1, since vertex and edges correspond
              faceIdOfMyFaceA2: rightFaceId,
              edgeIdOfMyFaceA2: ogPoingIdsToRightPointIds.get(theOldEdgeIdOfMyFace)
            },
            sideB: {
              faceIdOfMyFaceB: currentItem.idOfOtherFace,
              edgeIdOfMyFaceB: currentItem.edgeIdOfOtherFace
            }

          });
          continue;
      }



      // find out where the old edge when to
      if (Array.from(ogPointIdsToLeftPointIds.keys()).includes(theOldEdgeIdOfMyFace)) {
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
      } else if (Array.from(ogPoingIdsToRightPointIds.keys()).includes(theOldEdgeIdOfMyFace)) {
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
 * Udpate the adjcency list when merging a face
 * @param mergedFaceId - the id of the new merged face
 * @param firstFaceId - the id of the first face that's merged
 * @param secondFaceId  - the id of the second face that's merged
 * @param mapFromFirstFaceEdgeIdsToMergedEdges - a map of point ids in the left face that map to the merged face
 * @param mapFromSecondFaceEdgeIdsToMergedEdges - a map of point ids in the right face that map to the merged face
 */
export function updateAdjListForMergeGraph(
  mergedFaceId: bigint,
  firstFaceId: bigint,
  secondFaceId: bigint,
  mapFromFirstFaceEdgeIdsToMergedEdges: Map<bigint, bigint>,
  mapFromSecondFaceEdgeIdsToMergedEdges: Map<bigint, bigint>
) {
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
      if (item.idOfOtherFace !== secondFaceId) {
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
      }
    }

    const secondFaceConnections: EdgesAdjList[] | undefined = adjList.get(secondFaceId);
    if(secondFaceConnections === undefined) {
      throw new Error("missing adj storage");
    }

    // add udpate items for my mergedface -> list for the second Face
    for(const item of secondFaceConnections) {
      if (item.idOfOtherFace !== firstFaceId) {
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
      }
    }


    // now we need to update all of the other faces that have our oudated version
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
      if (currentItem.idOfOtherFace !== secondFaceId) {
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
      if (currentItem.idOfOtherFace !== firstFaceId) {
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



