/**
 * @fileoverview This file is an implementation of a graph of 2DFace objects
 * with public methods to manipulate the graph at a basic level.
 */

import { Face2D } from "../geometry/Face2D";
import { createPoint2D } from "../geometry/Point";

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


export function getAdjList() {
  return adjList;
}

export function updateAdjListForSplitGraph(
  ogFaceId: bigint,
  [leftFaceId, leftFaceEdgeIdThatFolds, ogPointIdsToLeftPointIds]: [bigint, bigint, Map<bigint, bigint>],
  [rightFaceId, rightFaceEdgeIdThatFolds, ogPoingIdsToRightPointIds]: [bigint, bigint, Map<bigint, bigint>],
  angle: bigint
) {
  // create new list, since we are making new planes
  adjList.set(leftFaceId, []);
  adjList.set(rightFaceId, []);

  const correctLeftFaceEdge: bigint | undefined =  leftFaceEdgeIdThatFolds;
  const correctRightFaceEdge:  bigint | undefined = rightFaceEdgeIdThatFolds;

  if (correctLeftFaceEdge === undefined || correctRightFaceEdge === undefined) {
    throw new Error("Incorrect mapping");
  }

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
      throw new Error("OUTDATED ADJ LIST");
    }


    // delete the copy from the other faces
    for (let i = 0; i < allOldConnectionsThatNeedToBeUdpdated.length; i++) {
      const currentItem = allOldConnectionsThatNeedToBeUdpdated[i];
      const outsideFaceToUpdate = currentItem.idOfOtherFace;

      deleteValue(outsideFaceToUpdate, ogFaceId);
    }


    // create the copy list, and add the copy to the other faces
    for (let i = 0; i < allOldConnectionsThatNeedToBeUdpdated.length; i++) {
      const currentItem = allOldConnectionsThatNeedToBeUdpdated[i];
      const theOldEdgeIdOfMyFace = currentItem.edgeIdOfMyFace;

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
        throw new Error("one should have happened");
      }
    }


    // delete the old face adj list
    adjList.delete(ogFaceId);
  }
}


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


export function updateRelativePositionBetweenFacesIndependentOfRelativeChange(faceId1: bigint, faceId2: bigint, relativeChange: bigint) {
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
      break;
    }
  }

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

export function add2dFaceToPaperGraph(face2d: Face2D) {
  idsToFaces.set(face2d.ID, face2d);
}

export function delete2dFaceToPaperGraph(faceId: bigint) {
  idsToFaces.delete(faceId);
}


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

export function printAdjList() {
  console.log(Array.from(adjList.entries()));
}



