/**
 * File is designed to run the main rendering for the editor.
 */


import * as THREE from 'three';
import * as input from './editorInputCapture';
import * as settings from "./globalSettings";
import * as SceneManager from "../SceneManager"
import {CameraManager} from "../CameraManager"
import {addAnnotationPoint, deleteAnnotationPoint, addAnnotationLine, deleteAnnotationLine} from "../../controller/Controller"
import { createPoint3D } from '../../geometry/Point';
import { Face3D } from '../../geometry/Face3D';
import { addlogfeedMessage } from './errordisplay/usererror';


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
	} else if (event.key === 's') {
		SceneManager.spinFace();
	}

}


// these store the two points selection for any action that
// has two inputs
let [closestPoint1, faceId1]: [bigint, bigint] = [-1n, -1n];
let [closestPoint2, faceId2]: [bigint, bigint] = [-1n, -1n];

// dom function that activates when a mouse button is pressed
async function onMouseDown(event : MouseEvent) {
	if (input.getIsPickPointButtonPressed()) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1.015;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1.02;

		raycaster.setFromCamera(mouse, cameraManager.getCamera());
		const intersects = raycaster.intersectObjects(SceneManager.getFaceObjects());



		if (intersects.length > 0) {

			const intersect = intersects[0];
			const object3dHit = intersect.object;
			const point = intersect.point;
			raySphere.position.set(point.x, point.y, point.z);

			let face3d = SceneManager.getFace3D(object3dHit);
			if (face3d === undefined) {
				return;
			}
			const result: string | true = await addAnnotationPoint(createPoint3D(point.x, point.y, point.z), face3d.ID);
			if (result !== true) {
				addlogfeedMessage("red", "Error: ", result);
			}

			input.resetIsPickPointButtonPressed(); // Reset after picking
		}
	} else if (input.getIsDeletePointButtonPressed()) {

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 0.97;

        const [closestPoint, faceId] = getClosestPointViaRaycast();
				console.log("RESUL OF CLOSES POINT ID: " + closestPoint);
        if (closestPoint) {
            // remove the closest annotation point
            const result: string | true = await deleteAnnotationPoint(closestPoint, faceId);
						if (result !== true) {
							addlogfeedMessage("red", "Error: ", result);
						}
        } else {
            console.log('No annotation point found near the click.');
        }

        input.resetIsDeletePointButtonPressed(); // Reset the delete button state
    } else if(input.doubleButtonPressed1st() && input.getAddLineButton()) {


			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 0.97;

			if (!input.doubleButtonPressed2nd()) {
				// first point select
				[closestPoint1, faceId1] = getClosestPointViaRaycast();
				input.startSecondPress();
			} else {
				[closestPoint2, faceId2] = getClosestPointViaRaycast();

				// check both points are on the same plane, and no	 the same point
				if (faceId1 !== faceId2 || closestPoint1 === closestPoint2) {
					input.resetDoubleButtonPressed(); // Reset the delete button state
					closestPoint1 = -1n;
					faceId1 = -1n;
					closestPoint2 = -1n;
					faceId2 = -1n;
					return;
				}

				if (closestPoint1 && closestPoint2) {
						// create line
						console.log("points ids: ", closestPoint1, closestPoint2);

						const result: string | true = await addAnnotationLine(closestPoint1, closestPoint2, faceId1);
						if (result !== true) {
							addlogfeedMessage("red", "Error: ", result);
						}
						console.log(`Ran`);
				} else {
						console.log('No annotation point found near the clicks.');
				}

				closestPoint1 = -1n;
				faceId1 = -1n;
				closestPoint2 = -1n;
				faceId2 = -1n;
				input.resetDoubleButtonPressed(); // Reset the delete button state
			}
		} else if(input.doubleButtonPressed1st() && input.getDeleteLineButton()) {


			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 0.97;

			if (!input.doubleButtonPressed2nd()) {
				// first point select
				[closestPoint1, faceId1] = getClosestPointViaRaycast();
				input.startSecondPress();
			} else {
				[closestPoint2, faceId2] = getClosestPointViaRaycast();

				// check both points are on the same plane, and no	 the same point
				if (faceId1 !== faceId2 || closestPoint1 === closestPoint2) {
					input.resetDoubleButtonPressed(); // Reset the delete button state
					closestPoint1 = -1n;
					faceId1 = -1n;
					closestPoint2 = -1n;
					faceId2 = -1n;
					return;
				}

				if (closestPoint1 && closestPoint2) {
						// create line
						console.log("points ids: ", closestPoint1, closestPoint2);
						const face3d : Face3D | undefined = SceneManager.getFace3DByID(faceId1);
						if (face3d === undefined) {
							return;
						}

						const lineId : bigint = face3d.getLineIdFromPointIds(closestPoint1, closestPoint2);
						if (lineId === -1n) {
							return;
						}

						const result: string | true = await deleteAnnotationLine(lineId, face3d.ID);
						if (result !== true) {
							addlogfeedMessage("red", "Error: ", result);
						}

						console.log(`Ran`);
				} else {
						console.log('No annotation point found near the clicks.');
				}

				closestPoint1 = -1n;
				faceId1 = -1n;
				closestPoint2 = -1n;
				faceId2 = -1n;
				input.resetDoubleButtonPressed(); // Reset the delete button state
			}
		}


}

/**
 *
 * @returns the id of the closest point after shooting a raycast from mouse at camera
 */
function getClosestPointViaRaycast() : [bigint, bigint] {
	raycaster.setFromCamera(mouse, cameraManager.getCamera());
	const intersects = raycaster.intersectObjects(SceneManager.getFaceObjects());
	// find the closest annotation point to the mouse click
	const intersect = intersects[0];
	console.log("intersections", intersect);
	const object3dHit = intersect.object;
	const point = intersect.point;
	raySphere.position.set(point.x, point.y, point.z);

	let face3d = SceneManager.getFace3D(object3dHit);

	if (face3d === undefined) {
		console.error("face 3d id doesn't exists");
		return [-1n, -1n];
	}

	const closestPointId = face3d.findNearestPoint(createPoint3D(point.x, point.y, point.z));
	return [closestPointId, face3d.ID];
}


// The function which runs every frame.
function animate() {

	if (input.getIsPickPointButtonPressed()) {
		cameraManager.lockMovement();
	} else {
		cameraManager.unlockMovement();
	}

	SceneManager.updateAnimations();

	renderer.render(
		SceneManager.getScene(),
		cameraManager.getCamera()
	);

}

renderer.setAnimationLoop(animate);