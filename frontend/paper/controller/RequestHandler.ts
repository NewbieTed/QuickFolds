/**
 * @fileoverview This file implements the functionality of sending and receiving
 * to the backend over network, and further parsing that data to and from the object
 * representations used by the frontend like Point2D, Face2D, etc. It makes
 * use of the Serializer to specifically handle conversion between request data
 * and frontend data (that is, serialization and deserialization).
 */

import { AnnotationUpdate2D, Face2D } from "../geometry/Face2D.js";
import {serializeMergeFold, serializeResultChange, serializeSplitFold} from "./Serializer.js";
import {processAnnotationStep} from "./Controller.js";



/**
 * Sends the backend a fold request to merge the faces, no rotation
 * @param leftFaceId - the first face to merge
 * @param rightFaceId - the id of the second face to merge
 * @param mergedFace - the new Face object that comes from merging
 * @returns a boolean as to the result of the action
 */
export async function addMergeFoldToDB(leftFaceId: bigint, rightFaceId: bigint, mergedFace: Face2D): Promise<boolean> {
  // add points locally
  const url = 'http://localhost:8080/geometry/fold';
  const data = serializeMergeFold(leftFaceId, rightFaceId, mergedFace);

  console.log(data);

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
    console.log('Response:', result);
    return Promise.resolve(true);
  } catch (error) {
    console.error('Error:', error);
  }

  return Promise.resolve(false);
}



/**
 * Sends the backend a fold request to split the faces, no rotation
 * @param leftFace - the newly created first face
 * @param rightFace - the newly created second face
 * @param ogFaceId - the id of the broken face
 * @param stationaryNewFaceID - the id of the new face that doesn't move during a rotation
 * @returns boolean as to result
 */
export async function addSplitFacesToDB(leftFace: Face2D, rightFace: Face2D, ogFaceId: bigint, stationaryNewFaceID: bigint): Promise<boolean> {
  // add points locally
  const url = 'http://localhost:8080/geometry/fold';
  const data = serializeSplitFold(leftFace, rightFace, ogFaceId, stationaryNewFaceID);

  console.log(data);

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
    console.log('Response:', result);
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
  const url = 'http://localhost:8080/geometry/annotate';
  const data = serializeResultChange(statusUpdate, faceId);

  console.log(data);

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
    console.log('Response:', result);
    return Promise.resolve(true);
  } catch (error) {
    console.error('Error:', error);
  }

  return Promise.resolve(false);
}

/**
 * Sends the backend a fold request to merge the faces, no rotation
 * @returns a boolean as to the result of the action
 */
export async function getStepFromDB(startStep: bigint, endStep: bigint, isForward: boolean) : Promise<boolean> {
  // /geometry/getStep/{origamiId}/{startStep}/{endStep}/{isForward}
  // const url = 'http://localhost:8080/geometry/getStep/1/' + startStep + '/' + endStep + '/' + isForward;
  //const data = serializeMergeFold(leftFaceId, rightFaceId, mergedFace);


  try {
    // const response = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     "Content-Type" : "application/json"
    //   },
    //   //body: JSON.stringify(data)
    // });

    // if (!response.ok) {
    //   throw new Error('Request failed');
    // }

    // const result = await response.json();
    // console.log('Step Response:', result);

    // // if we did annotation step, we need to process the step
    // if (result.stepType === "ANNOTATE") {
    //   // Handle annotation step
    //   return processAnnotationStep(result);
    // }

    // {
    //   "faceIdInOrigami": 0,
    //   "idInFace": 4,
    //   "x": 1.5,
    //   "y": -1,
    //   "onEdgeIdInFace": -1n
    // },
    const result = {
      "stepType": "ANNOTATE", 
      "annotations": [
        {
          "idInOrigami": 0, // Face ID in the origami model
          "points": [{
            "faceIdInOrigami": 0,
            "idInFace": 4,
            "x": 1.5,
            "y": -1,
            "onEdgeIdInFace": -1n
          },],
          "lines": [],
          "deletedPoints": [], // IDs of points to delete
          "deletedLines": []      // IDs of lines to delete
        },
      ]
    }

    const result2 = {
      "stepType": "ANNOTATE", 
      "annotations": [
        {
          "idInOrigami": 0, // Face ID in the origami model
          "points": [{
            "faceIdInOrigami": 0,
            "idInFace": 5,
            "x": 1.5,
            "y": 0,
            "onEdgeIdInFace": -1n
          },],
          "lines": [],
          "deletedPoints": [], // IDs of points to delete
          "deletedLines": []      // IDs of lines to delete
        },
      ]
    }

    const result3 = {
      "stepType": "ANNOTATE", 
      "annotations": [
        {
          "idInOrigami": 0, // Face ID in the origami model
          "points": [{
            "faceIdInOrigami": 0,
            "idInFace": 4,
            "x": 1.5,
            "y": -1,
            "onEdgeIdInFace": 6n
          },{
            "faceIdInOrigami": 0,
            "idInFace": 5,
            "x": 1.5,
            "y": 0,
            "onEdgeIdInFace": 6n
          },],
          "lines": [{
            "faceIdInOrigami": 0,
            "idInFace": 6,
            "point1IdInFace": 4n,
            "point2IdInFace": 5n
          },],
          "deletedPoints": [], // IDs of points to delete
          "deletedLines": []      // IDs of lines to delete
        },
      ]
    }

    const result4 = {
      "stepType": "ANNOTATE", 
      "annotations": [
        {
          "idInOrigami": 0, // Face ID in the origami model
          "points": [{
            "faceIdInOrigami": 0,
            "idInFace": 4,
            "x": 1.5,
            "y": -1,
            "onEdgeIdInFace": -1n
          },{
            "faceIdInOrigami": 0,
            "idInFace": 5,
            "x": 1.5,
            "y": 0,
            "onEdgeIdInFace": -1n
          },],
          "lines": [],
          "deletedPoints": [], // IDs of points to delete
          "deletedLines": [6]      // IDs of lines to delete
        },
      ]
    }

    if (result.stepType === "annotate") {
      if (result.annotations.length === 0) {
        console.log("No annotations found");
        return false;
      } else {
        console.log("startStep", startStep);
        if (!isForward) {
          processAnnotationStep(result4);
        }
        if (startStep === 1n) {
          processAnnotationStep(result);
        } else if (startStep === 2n) {
          console.log("result2AAAAAAAAAAAAAAAA");
          processAnnotationStep(result2);
         } else if (startStep === 3n) {
            console.log("result3AAAAAAAAAAAAAAAA");
            processAnnotationStep(result3);
        }
      }
    } else if (result.stepType === "fold") {
      console.log("fold");
    }
    
    console.log('Response:', result);
    return Promise.resolve(true);
  } catch (error) {
    console.error('Error:', error);
  }

  return Promise.resolve(false);
}

