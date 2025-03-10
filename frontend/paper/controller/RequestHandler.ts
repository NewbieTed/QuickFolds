/**
 * @fileoverview This file implements the functionality of sending and receiving
 * to the backend over network, and further parsing that data to and from the object
 * representations used by the frontend like Point2D, Face2D, etc. It makes
 * use of the Serializer to specifically handle conversion between request data
 * and frontend data (that is, serialization and deserialization).
 */

import { AnnotationUpdate2D, Face2D } from "../geometry/Face2D.js";
import {serializeMergeFold, serializeResultChange, serializeSplitFold} from "./Serializer.js";
import {processAnnotationStep, processFoldStep} from "./Controller.js";


const ANNOTATE_EDITOR_URL = 'http://localhost:8080/geometry/annotate';
const FOLDER_EDITOR_URL = 'http://localhost:8080/geometry/fold';


/**
 * takes a list of edges and adds them to the db in one step
 * @param listOfAllMovingFacesInDsSet - list of edges to update, providing both moving and static faces
 */
export async function addRotationListToDB(listOfAllMovingFacesInDsSet: {moveFace:bigint, statFace:bigint}[]) {
  return true;
}


/**
 * Sends the backend a fold request to merge the faces, no rotation
 * @param leftFaceId - the first face to merge
 * @param rightFaceId - the id of the second face to merge
 * @param mergedFace - the new Face object that comes from merging
 * @returns a boolean as to the result of the action
 */
// export async function addMergeFoldToDB(facesToAdd: Face2D[], facesToDelete: bigint[], stationaryNewFaceID: bigint): Promise<boolean> {
//   // note: for now, put stationaryNewFaceID as stationaryNewFaceID, and frontend can rederive it by matching up point ids
//   // since either the left face or the right face must match
//   // add points locally
//   const url = FOLDER_EDITOR_URL;
//   // const data = serializeMergeFold(leftFaceId, rightFaceId, mergedFace);

//   console.log(data);

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         "Content-Type" : "application/json"
//       },
//       body: JSON.stringify(data)
//     });

//     if (!response.ok) {
//       throw new Error('Request failed');
//     }

//     const result = await response.json();
//     console.log('Response:', result);
//     return Promise.resolve(true);
//   } catch (error) {
//     console.error('Error:', error);
//   }

//   return Promise.resolve(false);
// }



/**
 * Sends the backend a fold request to split the faces, no rotation
 * @param leftFace - the newly created first face
 * @param rightFace - the newly created second face
 * @param ogFaceId - the id of the broken face
 * @param stationaryNewFaceID - the id of the new face that doesn't move during a rotation
 * @returns boolean as to result
 */
export async function addSplitFacesToDB(facesToAdd: Face2D[], facesToDelete: bigint[], stationaryNewFaceID: bigint): Promise<boolean> {
  // add points locally
  const url = FOLDER_EDITOR_URL;
  const data = serializeSplitFold(facesToAdd, facesToDelete, stationaryNewFaceID);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const result = await response.json();

    return Promise.resolve(true);
  } catch (error) {
    console.error('Error:', error);
  }

  return Promise.resolve(false);
}


/**
 * takes a status update,
 * then updates the backend database with the system update
 * @param statusUpdate - the status update containing the new point
 * @param faceId - the id of the face this occurs at
 * @returns - a boolean as to whether the request was a success
 */
export async function addUpdatedAnnoationToDB(
  statusUpdate: AnnotationUpdate2D,
  faceId: bigint
) : Promise<boolean> {
  // add points locally
  const url = ANNOTATE_EDITOR_URL;
  const data = serializeResultChange(statusUpdate, faceId);


  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const result = await response.json();

    return Promise.resolve(true);
  } catch (error) {
    console.error('Error:', error);
  }

  return Promise.resolve(false);
}

/**
 * Fetches step data from the backend for the current origami
 * @param startStep - The starting step ID
 * @param endStep - The ending step ID
 * @param isForward - Whether we're moving forward in the steps
 * @returns a boolean indicating success or failure
 */
export async function getStepFromDB(startStep: bigint, endStep: bigint, isForward: boolean) : Promise<boolean> {
  // Get the origami ID from the SceneManager instead of directly from localStorage
  const origamiId = localStorage.getItem("currentOrigamiIdForViewer");

  if (!origamiId) {
    console.error("No origami ID found in localStorage");
    return Promise.resolve(false);
  }

  // Convert the values to strings for the URL
  // Make sure isForward is properly formatted as a string "true" or "false"
  const url = `http://localhost:8080/geometry/getStep/${origamiId}/${startStep.toString()}/${endStep.toString()}/${isForward.toString()}`;


  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.error(`Request failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      throw new Error('Request failed');
    }

    const result = await response.json();
    console.log('Step Response:', result.data);



    // const result = {
    //   "stepType": "ANNOTATE",
    //   "annotations": [
    //     {
    //       "idInOrigami": 0, // Face ID in the origami model
    //       "points": [{
    //         "faceIdInOrigami": 0,
    //         "idInFace": 4,
    //         "x": 1.5,
    //         "y": -1,
    //         "onEdgeIdInFace": -1n
    //       },],
    //       "lines": [],
    //       "deletedPoints": [], // IDs of points to delete
    //       "deletedLines": []      // IDs of lines to delete
    //     },
    //   ]
    // }

    // const result2 = {
    //   "stepType": "ANNOTATE",
    //   "annotations": [
    //     {
    //       "idInOrigami": 0, // Face ID in the origami model
    //       "points": [{
    //         "faceIdInOrigami": 0,
    //         "idInFace": 5,
    //         "x": 1.5,
    //         "y": 0,
    //         "onEdgeIdInFace": -1n
    //       },],
    //       "lines": [],
    //       "deletedPoints": [], // IDs of points to delete
    //       "deletedLines": []      // IDs of lines to delete
    //     },
    //   ]
    // }

    // const result3 = {
    //   "stepType": "ANNOTATE",
    //   "annotations": [
    //     {
    //       "idInOrigami": 0, // Face ID in the origami model
    //       "points": [{
    //         "faceIdInOrigami": 0,
    //         "idInFace": 4,
    //         "x": 1.5,
    //         "y": -1,
    //         "onEdgeIdInFace": 6n
    //       },{
    //         "faceIdInOrigami": 0,
    //         "idInFace": 5,
    //         "x": 1.5,
    //         "y": 0,
    //         "onEdgeIdInFace": 6n
    //       },],
    //       "lines": [{
    //         "faceIdInOrigami": 0,
    //         "idInFace": 6,
    //         "point1IdInFace": 4n,
    //         "point2IdInFace": 5n
    //       },],
    //       "deletedPoints": [], // IDs of points to delete
    //       "deletedLines": []      // IDs of lines to delete
    //     },
    //   ]
    // }

    // const result4 = {
    //   "stepType": "ANNOTATE",
    //   "annotations": [
    //     {
    //       "idInOrigami": 0, // Face ID in the origami model
    //       "points": [{
    //         "faceIdInOrigami": 0,
    //         "idInFace": 4,
    //         "x": 1.5,
    //         "y": -1,
    //         "onEdgeIdInFace": -1n
    //       },{
    //         "faceIdInOrigami": 0,
    //         "idInFace": 5,
    //         "x": 1.5,
    //         "y": 0,
    //         "onEdgeIdInFace": -1n
    //       },],
    //       "lines": [],
    //       "deletedPoints": [], // IDs of points to delete
    //       "deletedLines": [6]      // IDs of lines to delete
    //     },
    //   ]
    // }

    // if we did annotation step, we need to process the step
    if (result.data.stepType === "annotate") {
      if (result.data.annotations.length === 0) {
        console.log("No annotations found");
        return false;
      } else {
        processAnnotationStep(result.data);
      }
    } else if (result.data.stepType === "fold") {
      processFoldStep(result.data);
    }

    return Promise.resolve(true);
  } catch (error) {
    console.error('Error:', error);
  }

  return Promise.resolve(false);
}

