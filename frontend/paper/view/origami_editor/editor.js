/**
 * File is designed to run the main rendering for the editor.
 */


import * as THREE from 'three';
import { getIsRotateSphereVisible, getIsShiftKeyPressed, getIsLeftMousePressed, getIsPickPointButtonPressed, resetIsPickPointButtonPressed, getIsDeletePointButtonPressed, resetIsDeletePointButtonPressed} from './editorInputCapture.js';
import {UP_DIRECTION, RETURN_TO_ORIGIN_KEY, SWAP_CAM_TYPE	} from "./globalSettings.js";
import {Face3D} from "../../geometry/Face3D.ts";
import {createPoint3D} from "../../geometry/Point.ts";
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { startup, threeJSIdsToOurIds } from '../SceneManager.ts';
import {addAnnotationPoint} from "../../controller/Controller.ts";

document.addEventListener('keydown', onKeyDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('mousedown', onMouseDown);

let faces = []; // field to store all face objects

let prevRotateChange = true; // used for reducing rendering work

let prevMouseXPos = null;
let prevMouseYPos = null;

let diffX = 0;
let diffY = 0;

// The point in space the camera will rotate around
let camRotatePt = new THREE.Vector3(0, 0, 0);

// Creating the scene to edit in.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Set up environment for proper lighting.
const environment = new RoomEnvironment(renderer)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(environment).texture;
environment.dispose();


// how far cam rotates away from point
let distance = 5;

const PERSPECTIVE_CAMERA = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const frustumSize = 10; // Size of the orthographic view
const aspect = window.innerWidth / window.innerHeight;

const mouse = new THREE.Vector2(); // Mouse position
const raycaster = new THREE.Raycaster();



const ORTHOGRAPHIC_CAMERA = new THREE.OrthographicCamera(
		-frustumSize * aspect / 2,  // left
		frustumSize * aspect / 2,   // right
		frustumSize / 2,            // top
		-frustumSize / 2,           // bottom
		0.01,  // Near clipping plane
		100  // Far clipping plane
);


let camera = ORTHOGRAPHIC_CAMERA;

if (prevRotateChange) {
	camera = PERSPECTIVE_CAMERA;
}


// window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);

    console.log("Window resized: Updated camera & renderer");
});



// zoom settings
const MAX_ZOOM = 20;
const MIN_ZOOM = 2;
const SCROLL_SPEED = 1;


// Create visual axes/grid.
const grid = new THREE.GridHelper(10, 10);
scene.add(grid);

// // create plane
// const geometryPlane = new THREE.PlaneGeometry(5, 5);
// const materialGreen = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const plane = new THREE.Mesh(geometryPlane, materialGreen);
// plane.material.side = THREE.DoubleSide;
// faces.push(plane);

// create cam look at pt
const geometrySphere = new THREE.SphereGeometry(0.05);
const whiteMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const lookAtSphere = new THREE.Mesh(geometrySphere, whiteMaterial);
lookAtSphere.visible = getIsRotateSphereVisible();
scene.add(lookAtSphere);












// Attempt to create a Face3D.
const vertices = [
	createPoint3D(0, 0, 0, "Vertex"),
	createPoint3D(0, 0, 5, "Vertex"),
	createPoint3D(5, 0, 5, "Vertex"),
	createPoint3D(5, 0, 0, "Vertex")
]
const principalNormal = createPoint3D(0, 1, 0);
const plane = new Face3D(vertices, 0.1, 0, principalNormal);
const object = plane.getMesh();
scene.add(object);
faces.push(object);
startup(plane, object);












// Add a point light to be able to see it
const pointLight = new THREE.PointLight(0xffffff, 0.25, 0, 1);
pointLight.position.set(0, 10, 10);
scene.add(pointLight);
scene.add(new THREE.PointLightHelper(pointLight, 2, 0xffff00));
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;
plane.getMesh().receiveShadow = true;
plane.getMesh().castShadow = true;

// raycast test pt
const raycastSphere = new THREE.SphereGeometry(0.05);
const blueMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const raySphere = new THREE.Mesh(raycastSphere, blueMaterial);
raySphere.visible = true;

// put stuff in scene
// scene.add( plane );
scene.add(lookAtSphere);
scene.add(raySphere);
// plane.rotateX(90);

// Set camera position.
camera.position.z = 5;


// Add event listener for mouse wheel scroll
window.addEventListener('wheel', changeZoomDistance);

function changeZoomDistance(event) {
	distance += SCROLL_SPEED * 0.005 * event.deltaY;

	distance = Math.min(MAX_ZOOM, distance);
	distance = Math.max(MIN_ZOOM, distance);
}

// returns the camera in the editor to the ORIGIN of the editor space
function returnCameraToOrigin() {
	camRotatePt = new THREE.Vector3(0, 0, 0);
	lookAtSphere.position.copy(camRotatePt);
	renderer.render( scene, camera );
}

// // temporary mesh objects defined for raycasting
// const tempGeometry = new THREE.PlaneGeometry(1, 1);
// const tempMaterials = [
//   new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
//   new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide })
// ];

// const faces = tempMaterials.map((material, index) => {
//   const face = new THREE.Mesh(tempGeometry, material);
//   face.position.set(index * 1.5 - 1.5, 0.5, 0);  // Adjust positions
//   scene.add(face);
//   return face;
// });



// swaps between ortho and persective camera
function swapCameraType() {
	if (camera === PERSPECTIVE_CAMERA) {
		ORTHOGRAPHIC_CAMERA.position.set(PERSPECTIVE_CAMERA.x, PERSPECTIVE_CAMERA.y, PERSPECTIVE_CAMERA.z);
		ORTHOGRAPHIC_CAMERA.setRotationFromEuler(PERSPECTIVE_CAMERA.rotation);
		camera = ORTHOGRAPHIC_CAMERA;
	} else if (camera === ORTHOGRAPHIC_CAMERA) {
		PERSPECTIVE_CAMERA.position.set(ORTHOGRAPHIC_CAMERA.x, ORTHOGRAPHIC_CAMERA.y, ORTHOGRAPHIC_CAMERA.z);
		PERSPECTIVE_CAMERA.setRotationFromEuler(ORTHOGRAPHIC_CAMERA.rotation);
		camera = PERSPECTIVE_CAMERA	;
	}
}



// dom function that activates when a key is pressed
function onKeyDown(event) {
	if (event.key === RETURN_TO_ORIGIN_KEY) {
    returnCameraToOrigin();
  }
	if (event.key === SWAP_CAM_TYPE) {
    swapCameraType();
  }
}

// dom function that activates when a mouse button is released
function onMouseUp(event) {
  if (event.button === 0) {  // 0 is LMB
      prevMouseXPos = null;
      prevMouseYPos = null;
  }
}

function getClosestAnnotationPointToMouse(points, raycaster) {
    let closestPoint = null;
    let minDistance = Infinity;

    points.forEach(point => {
        const pointVector = new THREE.Vector3(point.x, point.y, point.z);
        const distance = raycaster.ray.distanceToPoint(pointVector);
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    });

    // Define a threshold for clicking accuracy (e.g., 0.1 units in 3D space)
    return minDistance < 0.1 ? closestPoint : null;
}

// dom function that activates when a mouse button is pressed
function onMouseDown(event) {
	if (getIsPickPointButtonPressed()) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1.015;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1.02;

		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(faces);



		if (intersects.length > 0) {

			const intersect = intersects[0];
			const point = intersect.point;
			raySphere.position.set(point.x, point.y, point.z);

			let idOfFaceHit = threeJSIdsToOurIds(intersect.object);
			console.log(idOfFaceHit + "]");
			if (idOfFaceHit === undefined) {
				return;
			}
			addAnnotationPoint(point, idOfFaceHit);

			resetIsPickPointButtonPressed(); // Reset after picking
		}
	} else if (getIsDeletePointButtonPressed()) {

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 0.97;

        raycaster.setFromCamera(mouse, camera);
        return; // ignore code for now

        // get the list of annotation points
        const annotationPoints = getAllAnnotationPoints();

        // find the closest annotation point to the mouse click
        const closestPoint = getClosestAnnotationPointToMouse(annotationPoints, raycaster);

        if (closestPoint) {
            // remove the closest annotation point
            removeAnnotationPoint(closestPoint);
            console.log(`Deleted annotation point at: x=${closestPoint.x}, y=${closestPoint.y}, z=${closestPoint.z}`);
        } else {
            console.log('No annotation point found near the click.');
        }

        resetIsDeletePointButtonPressed(); // Reset the delete button state
    }

}

// dom function that runs when the mouse move
document.onmousemove = (event) => {
	// calculate how much you move left and right on mouse move
	if (getIsLeftMousePressed()) {
		let currentXPos = event.clientX * 100 / window.innerWidth;
		let currentYPos = event.clientY * 100 / window.innerHeight;

		if (prevMouseXPos != null && prevMouseYPos != null) {
			diffX = prevMouseXPos - currentXPos;
			diffY = prevMouseYPos - currentYPos;
		}

		prevMouseXPos = currentXPos;
		prevMouseYPos = currentYPos;
	}
}

// stores cam rotation
let groundAngle = 0; // radian on the xz plane to store direction
let upperAngle = 0;  // radian on the yz plane to store direction


// runs every animation frame
// similar to SetInterval, but less computationally expensive for Three.js
function animate() {
	if (!getIsPickPointButtonPressed()) {
		if (getIsShiftKeyPressed()) {
			// do camera movement
			let forwardDirection = new THREE.Vector3();
			camera.getWorldDirection(forwardDirection);
			let xzProjectNormalized = new THREE.Vector3(forwardDirection.x, 0, forwardDirection.z).normalize();
			let forwardVector = xzProjectNormalized.multiplyScalar(diffY * 	-0.5);

			// compute direction.right vector
			let rightVector = new THREE.Vector3().crossVectors(UP_DIRECTION, forwardDirection);
			rightVector.normalize().multiplyScalar(diffX * -0.5);

			camRotatePt.add(forwardVector).add(rightVector);
			lookAtSphere.position.set(camRotatePt.x, camRotatePt.y, camRotatePt.z)
		} else {
			// do camera rotation
			console.log("camera rot");
			groundAngle += diffX * 0.1;
			upperAngle += diffY * 0.05;
			upperAngle = Math.max(-Math.PI/2, upperAngle);
			upperAngle = Math.min(Math.PI/2	, upperAngle);
		}



		// update cam rot and pos
		camera.position.copy(camRotatePt).add(new THREE.Vector3(distance * Math.sin(groundAngle), 1.25 * distance * Math.sin(upperAngle), distance * Math.cos(groundAngle)));
		camera.lookAt(camRotatePt);

		diffX = 0;
		diffY = 0;

		// only change lookAtSphere if boolean has changed
		if (prevRotateChange !== getIsRotateSphereVisible()) {
			lookAtSphere.visible = getIsRotateSphereVisible();
			prevRotateChange = getIsRotateSphereVisible();
		}
	}
	renderer.render( scene, camera );

}


renderer.setAnimationLoop( animate );
export {returnCameraToOrigin};