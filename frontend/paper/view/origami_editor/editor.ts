/**
 * File is designed to run the main rendering for the editor.
 */


import * as THREE from 'three';
import * as input from './editorInputCapture';
import * as settings from "./globalSettings";
import * as SceneManager from "../SceneManager"
import {CameraManager} from "../CameraManager"


document.addEventListener('keydown', onKeyDown);
document.addEventListener('mousedown', onMouseDown);

let faces = []; // field to store all face objects

// Create the renderer.
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the scene and camera.
SceneManager.initialize(renderer);
const cameraManager = new CameraManager(SceneManager.getScene());

 // Create the raycaster.
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();


// Handle window resizing.
window.addEventListener('resize', () => {

	cameraManager.resizeWindow();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log("Window resized: Updated camera & renderer");

});


// raycast test pt
const raycastSphere = new THREE.SphereGeometry(0.05);
const blueMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const raySphere = new THREE.Mesh(raycastSphere, blueMaterial);
raySphere.visible = true;
SceneManager.getScene().add(raySphere);


// Handle key pressing.
function onKeyDown(event: KeyboardEvent) {

	if (event.key === settings.RETURN_TO_ORIGIN_KEY) {
    	cameraManager.returnToOrigin();
  	} else if (event.key === settings.SWAP_CAM_TYPE_KEY) {
    	cameraManager.swapCameraType();
  	} else if (event.key === settings.TOGGLE_FOCAL_PT_KEY) {
		cameraManager.toggleFocalPointVisible();
	}

}


// function getClosestAnnotationPointToMouse(points, raycaster: THREE.Raycaster) {
//     let closestPoint = null;
//     let minDistance = Infinity;

//     points.forEach(point => {
//         const pointVector = new THREE.Vector3(point.x, point.y, point.z);
//         const distance = raycaster.ray.distanceToPoint(pointVector);
//         if (distance < minDistance) {
//             minDistance = distance;
//             closestPoint = point;
//         }
//     });

//     // Define a threshold for clicking accuracy (e.g., 0.1 units in 3D space)
//     return minDistance < 0.1 ? closestPoint : null;
// }


// dom function that activates when a mouse button is pressed
function onMouseDown(event: MouseEvent) {
	if (input.getIsPickPointButtonPressed()) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1.015;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1.02;

		raycaster.setFromCamera(mouse, cameraManager.getCamera());
		const intersects = raycaster.intersectObjects(
			SceneManager.getFaceObjects()
		);

		if (intersects.length > 0) {
			const intersect = intersects[0];
			const point = intersect.point;
			raySphere.position.set(point.x, point.y, point.z);
			console.log(`Clicked coordinates: x=${point.x.toFixed(2)}, y=${point.y.toFixed(2)}, z=${point.z.toFixed(2)}`);

			input.resetIsPickPointButtonPressed(); // Reset after picking
		}

	} else if (input.getIsDeletePointButtonPressed()) {

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 0.97;

        raycaster.setFromCamera(mouse, cameraManager.getCamera());
        return; // ignore code for now

        // // get the list of annotation points
        // const annotationPoints = getAllAnnotationPoints();

        // // find the closest annotation point to the mouse click
        // const closestPoint = getClosestAnnotationPointToMouse(annotationPoints, raycaster);

        // if (closestPoint) {
        //     // remove the closest annotation point
        //     removeAnnotationPoint(closestPoint);
        //     console.log(`Deleted annotation point at: x=${closestPoint.x}, y=${closestPoint.y}, z=${closestPoint.z}`);
        // } else {
        //     console.log('No annotation point found near the click.');
        // }

        // input.resetIsDeletePointButtonPressed(); // Reset the delete button state
    }

}


// The function which runs every frame.
function animate() {

	if (input.getIsPickPointButtonPressed()) {
		cameraManager.lockMovement();
	} else {
		cameraManager.unlockMovement();
	}

	renderer.render(
		SceneManager.getScene(), 
		cameraManager.getCamera()
	);

}

renderer.setAnimationLoop(animate);