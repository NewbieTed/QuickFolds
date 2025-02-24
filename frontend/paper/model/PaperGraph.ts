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

  console.log("heres what i thinkg", ogPointIdsToLeftPointIds);
  const correctLeftFaceEdge: bigint | undefined =  leftFaceEdgeIdThatFolds; // ogPointIdsToLeftPointIds.get(leftFaceEdgeIdThatFolds);
  const correctRightFaceEdge:  bigint | undefined = rightFaceEdgeIdThatFolds;// ogPoingIdsToRightPointIds.get(rightFaceEdgeIdThatFolds);

  if (correctLeftFaceEdge === undefined || correctRightFaceEdge === undefined) {
    throw new Error("Incorrect mapping");
  }

  if (!Array.from(adjList.keys()).includes(ogFaceId)) {
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

// todo, update merging


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



