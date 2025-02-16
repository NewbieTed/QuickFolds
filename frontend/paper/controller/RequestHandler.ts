/**
 * @fileoverview This file implements the functionality of sending and receiving
 * to the backend over network, and further parsing that data to and from the object
 * representations used by the frontend like Point2D, Face2D, etc. It makes
 * use of the Serializer to specifically handle conversion between request data
 * and frontend data (that is, serialization and deserialization).
 */

import { Point2D } from "../geometry/Point";
import {serializeAddLine, serializeAddPoint, serializeDeleteLine, serializeDeletePoint} from "./Serializer";

/**
 * Sends API request to backend to add an annotation point
 * @param point - the new point to add
 * @param faceId - the id the face to add the point
 * @param pointId - the id of the point that is created
 * @param isPointOnEdge - the id of the edge the point is on, or null if not true
 * @returns boolean on whether the request to backend was sucessfull
 */
export async function addAnnotationPointToDB(
  point: Point2D,
  faceId: bigint,
  pointId: bigint,
  isPointOnEdge: bigint | null
) : Promise<boolean> {
  // add points locally
  const url = 'https://your-api-endpoint.com';
  const data = serializeAddPoint(point, faceId, pointId, isPointOnEdge);


  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'annotate/addannotatepoint',
      },
      body: JSON.stringify(data),
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
 * Sends API request to backend to delete an annotation point
 * @param faceId - the id the face to add the point
 * @param pointId - the id of the point that is created
 * @returns boolean on whether the request to backend was sucessfull
 */
export async function deleteAnnotationPointToDB(
  faceId: bigint,
  pointId: bigint
) : Promise<boolean> {
  // add points locally
  const url = 'https://your-api-endpoint.com';
  const data = serializeDeletePoint(faceId, pointId);


  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'annotate/addannotatepoint',
      },
      body: JSON.stringify(data),
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
 * Sends API request to backend to add an annotation line
 * @param point1Id - the id of the 1st point in the line segment that is created
 * @param point2Id - the id of the 2nd point in the line segment that is created
 * @param newAnnoLineId - the id of the line annotation
 * @param faceId - the id the face to add the point
 * @returns boolean on whether the request to backend was sucessfull
 */
export async function addAnnotationLineToDB(
  point1Id: bigint,
  point2Id: bigint,
  newAnnoLineId: bigint,
  faceId: bigint)  : Promise<boolean> {
  // add points locally
  const url = 'https://your-api-endpoint.com';
  const data = serializeAddLine(point1Id, point2Id, newAnnoLineId, faceId);


  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'annotate/addannotatepoint',
      },
      body: JSON.stringify(data),
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
 * Sends API request to backend to delete an annotation line
 * @param annoLineId - the id of the line annotation
 * @param faceId - the id the face to add the point
 * @returns boolean on whether the request to backend was sucessfull
 */
export async function deleteAnnotationLineToDB(
  annoLineId: bigint,
  faceId: bigint)  : Promise<boolean> {
  // add points locally
  const url = 'https://your-api-endpoint.com';
  const data = serializeDeleteLine(annoLineId, faceId);


  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'annotate/addannotatepoint',
      },
      body: JSON.stringify(data),
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



