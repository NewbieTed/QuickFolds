/**
 * @fileoverview This file implements the functionality of sending and receiving
 * to the backend over network, and further parsing that data to and from the object
 * representations used by the frontend like Point2D, Face2D, etc. It makes
 * use of the Serializer to specifically handle conversion between request data
 * and frontend data (that is, serialization and deserialization).
 */



async function addAnnotationPointToDB(point: Point2D, faceId: bigint) {
  // add points locally
  const url = 'https://your-api-endpoint.com';
  const data = Serializer.serializeAddPoint(point, faceId);


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
  } catch (error) {
    console.error('Error:', error);
  }

}


async function addAnnotationLineToDB(point1Id: bigint, point2Id: bigint, newAnnoLineId: bigint, faceId: bigint) {
  // add points locally
  const url = 'https://your-api-endpoint.com';
  const data = Serializer.serializeAddLine(point1Id, point2Id, newAnnoLineId, faceId);


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
  } catch (error) {
    console.error('Error:', error);
  }

}



