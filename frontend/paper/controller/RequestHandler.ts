/**
 * @fileoverview This file implements the functionality of sending and receiving
 * to the backend over network, and further parsing that data to and from the object
 * representations used by the frontend like Point2D, Face2D, etc. It makes
 * use of the Serializer to specifically handle conversion between request data
 * and frontend data (that is, serialization and deserialization).
 */

import { AnnotationUpdate2D, Face2D } from "../geometry/Face2D.js";
import {serializeMergeFold, serializeResultChange, serializeSplitFold} from "./Serializer.js";


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
  const url = ANNOTATE_EDITOR_URL;
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