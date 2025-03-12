/**
 * File is designed to run the main rendering for the editor.
 */


import * as THREE from 'three';
import * as input from './editorInputCapture.js';
import * as settings from "./globalSettings.js";
import * as SceneManager from "../SceneManager.js"
import {CameraManager} from "../CameraManager.js"

import {addAnnotationPoint, deleteAnnotationPoint, addAnnotationLine, deleteAnnotationLine, createMultiFoldBySplitting, updateExistingMultiFold} from "../../controller/Controller.js"
import { Point3D, createPoint3D, distance } from '../../geometry/Point.js';
import { Face3D } from '../../geometry/Face3D.js';
import { addlogfeedMessage } from './errordisplay/usererror.js';
import { getIsSplittingInsteadOfMerging } from './editorInputCapture.js';
import { getAdjList, getConnectionInAdjList } from '../../model/PaperGraph.js';



document.addEventListener('keydown', onKeyDown);
document.addEventListener('mousedown', onMouseDown);

let faces = []; // field to store all face objects

// Create the renderer.
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
const raycastSphere = new THREE.SphereGeometry(0.1);
const redMaterial = new THREE.MeshBasicMaterial( { color: 0xdb0000 } );
const raySphere = new THREE.Mesh(raycastSphere, redMaterial);
raySphere.visible = true;
SceneManager.getScene().add(raySphere);

// Create visual axes/grid.
const grid = new THREE.GridHelper(10, 10);
SceneManager.getScene().add(grid);


// Handle key pressing.
function onKeyDown(event: KeyboardEvent) {

	if (event.key === settings.RETURN_TO_ORIGIN_KEY) {
    	cameraManager.returnToOrigin();
  	} else if (event.key === settings.SWAP_CAM_TYPE_KEY) {
    	cameraManager.swapCameraType();
  	} else if (event.key === settings.TOGGLE_FOCAL_PT_KEY) {
		cameraManager.toggleFocalPointVisible();
		grid.visible = !grid.visible;
		raySphere.visible = !raySphere.visible;
	}
}


// these store the two points selection for any action that
// has two inputs
let [closestPoint1, faceId1]: [bigint, bigint] = [-1n, -1n];
let [closestPoint2, faceId2]: [bigint, bigint] = [-1n, -1n];

// dom function that activates when a mouse button is pressed
async function onMouseDown(event : MouseEvent) {
	let foldButtonState = input.getFoldButtonState();
	const foldAngleState = input.getFoldAngleState();
	if (input.getIsPickPointButtonPressed()) {

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, cameraManager.getCamera());
		const intersects = raycaster.intersectObjects(SceneManager.getFaceObjects());



		if (intersects.length > 0) {

			const intersect = intersects[0];
			const object3dHit = intersect.object;
			const point = createPoint3D(
				intersect.point.x,
				intersect.point.y,
				intersect.point.z
			);
			raySphere.position.set(point.x, point.y, point.z);

			let face3d = SceneManager.getFace3D(object3dHit);
			if (face3d === undefined) {
				return;
			}
			const projectedPoint = face3d.projectToFace(point);
			const [projectedEdgePoint, edgeId] = projectAndCreateEdgePoint(projectedPoint, face3d);
			const result: string | true = await addAnnotationPoint(projectedEdgePoint, face3d.ID, edgeId);
			if (result !== true) {
				addlogfeedMessage("red", "Error: ", result);
			}
		}
		input.resetIsPickPointButtonPressed(); // Reset after picking

	} else if (input.getIsDeletePointButtonPressed()) {

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const [closestPoint, faceId] = getClosestPointViaRaycast();

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
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

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

			if (closestPoint1 !== -1n && closestPoint2 !== -1n) {
					// create line
					const result: string | true = await addAnnotationLine(closestPoint1, closestPoint2, faceId1);
					if (result !== true) {
						addlogfeedMessage("red", "Error: ", result);
					}
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
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		if (!input.doubleButtonPressed2nd()) {
			// first point select
			[closestPoint1, faceId1] = getClosestPointViaRaycast();
			input.startSecondPress();
		} else {
			[closestPoint2, faceId2] = getClosestPointViaRaycast();

			// check both points are on the same plane, and no	 the same point
			if (faceId1 !== faceId2 || closestPoint1 === closestPoint2) {
				console.log("faces don't match/ or points are the same", closestPoint1, closestPoint2);
				input.resetDoubleButtonPressed(); // Reset the delete button state
				closestPoint1 = -1n;
				faceId1 = -1n;
				closestPoint2 = -1n;
				faceId2 = -1n;
				return;
			}

			if (closestPoint1 !== -1n && closestPoint2 !== -1n) {
					// create line
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

			} else {
					console.log('No annotation point found near the clicks.');
			}

			closestPoint1 = -1n;
			faceId1 = -1n;
			closestPoint2 = -1n;
			faceId2 = -1n;
			input.resetDoubleButtonPressed(); // Reset the delete button state
		}
	} else if (foldButtonState.isPressed && getIsSplittingInsteadOfMerging()) {
		// Handle fold button interaction
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


		if (foldButtonState.state.step === 1) {

			// first point select
			[closestPoint1, faceId1] = getClosestPointViaRaycast();

			const face3d : Face3D | undefined = SceneManager.getFace3DByID(faceId1);
			if (face3d === undefined) {
				return;
			}

			if (closestPoint1 === -1n) {
				return;
			}


			input.updateFoldState({
				...foldButtonState.state,
				point1Id: closestPoint1,
				faceId: faceId1,
				step: 2
			});

		} else if (foldButtonState.state.step === 2) {
			// second point select
			[closestPoint2, faceId2] = getClosestPointViaRaycast();

			const face3d : Face3D | undefined = SceneManager.getFace3DByID(faceId2);
			if (face3d === undefined) {
				return;
			}

			if (closestPoint2 === -1n) {
				return;
			}

			input.updateFoldState({
				...foldButtonState.state,
				point2Id: closestPoint2,
				faceId: faceId2,
				step: 3
			});

			// they have to be different point on the same face
			if (closestPoint1 === closestPoint2 || faceId1 !== faceId2) {
				input.resetFoldButton();
				closestPoint1 = -1n;
				faceId1 = -1n;
				closestPoint2 = -1n;
				faceId2 = -1n;
				return;
			}

			// Create dashed line illustration
			const face3d1 = SceneManager.getFace3DByID(faceId1);
			if (face3d1) {
				const point1 = face3d1.getPoint(closestPoint1);
				const point2 = face3d.getPoint(closestPoint2);

				// Create dashed line material
				const dashLineMaterial = new THREE.LineDashedMaterial({
					color: 0xff0000,
					dashSize: 0.5,
					gapSize: 0.25,
					linewidth: 1,
					scale: 1,
					opacity: 1.0,
					transparent: true,
					depthTest: false,   // ensures it draws on top
					depthWrite: false,
				});

				// Create line geometry
				const lineGeometry = new THREE.BufferGeometry().setFromPoints([
					new THREE.Vector3(point1.x, point1.y, point1.z),
					new THREE.Vector3(point2.x, point2.y, point2.z),
				]);

				// Create the line
				const dashLine = new THREE.Line(lineGeometry, dashLineMaterial);
				// Make sure dashed effect is calculated
				dashLine.computeLineDistances();

				// Optional: Render on top of everything
				dashLine.renderOrder = 999;
				dashLine.name = 'foldIllustrationLine';

				// Remove any existing 'foldIllustrationLine'
				const existingLine = SceneManager.getScene().getObjectByName('foldIllustrationLine');
				if (existingLine) {
					SceneManager.getScene().remove(existingLine);
					(existingLine as THREE.Line).geometry.dispose();

					// Dispose of old material(s)
					if (Array.isArray((existingLine as THREE.Line).material)) {
					((existingLine as THREE.Line).material as THREE.Material[]).forEach(mat => mat.dispose());
					} else {
					((existingLine as THREE.Line).material as THREE.Material).dispose();
					}
				}

				// Finally, add the new line
				SceneManager.getScene().add(dashLine);
			}

		} else if (foldButtonState.state.step === 3) {
			raycaster.setFromCamera(mouse, cameraManager.getCamera());
			const intersects = raycaster.intersectObjects(SceneManager.getFaceObjects());

			if (intersects.length > 0) {

				const intersect = intersects[0];
				const object3dHit = intersect.object;
				const point = createPoint3D(
					intersect.point.x,
					intersect.point.y,
					intersect.point.z
				);
				raySphere.position.set(point.x, point.y, point.z);

				const face3d = SceneManager.getFace3D(object3dHit);
				if (face3d === undefined) {
					return;
				}
				const projectedPoint = face3d.projectToFace(point);

				input.updateFoldState({
					...foldButtonState.state,
					stationaryPoint: projectedPoint,
					step: 4
				});

				// Verify the state update by getting the current state
				const currentState = input.getFoldButtonState();

				// Show angle popup
				const anglePopup = document.querySelector('.angle-popup');
				if (anglePopup) {
					(anglePopup as HTMLElement).style.display = 'block';
					(anglePopup as HTMLElement).style.left = event.clientX + 'px';
					(anglePopup as HTMLElement).style.top = event.clientY + 'px';
				}
			}

		}
		// current issue: all faces are being captured, i'm crossing the boundary

	} else if (foldButtonState.isPressed && !getIsSplittingInsteadOfMerging()) {
		// note: the state used here is going be the same as the split state
		//       THE NAMES OF THE STATES DO NOT CORRESPOND TO WHAT THEY MEAN FOR MERING
		//       point1Id acutally means face1Id of the edge I split
		//       point2Id acutally means face2Id of the edge I split
		//       faceId actually means the stationary face of the edge I split
		// it's not great, but it will merge into our system better

		// Handle fold button interaction
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


		if (foldButtonState.state.step === 1) {

			// first point select
			[closestPoint1, faceId1] = getClosestPointViaRaycast();

			const face3d : Face3D | undefined = SceneManager.getFace3DByID(faceId1);
			if (face3d === undefined) {
				return;
			}

			if (closestPoint1 === -1n) {
				return;
			}


			input.updateFoldState({
				...foldButtonState.state,
				point1Id: closestPoint1,
				faceId: faceId1,
				step: 2
			});

		} else if (foldButtonState.state.step === 2) {
			// second point select
			[closestPoint2, faceId2] = getClosestPointViaRaycast();

			const face3d : Face3D | undefined = SceneManager.getFace3DByID(faceId2);
			if (face3d === undefined) {
				return;
			}

			if (closestPoint2 === -1n) {
				return;
			}

			input.updateFoldState({
				...foldButtonState.state,
				point2Id: closestPoint2,
				faceId: faceId2,
				step: 3
			});

			// they have to be on different faces
			if (faceId1 === faceId2) {
				input.resetFoldButton();
				closestPoint1 = -1n;
				faceId1 = -1n;
				closestPoint2 = -1n;
				faceId2 = -1n;
				return;
			}

			// Create dashed line illustration
			const face3d1 = SceneManager.getFace3DByID(faceId1);
			const face3d2 = SceneManager.getFace3DByID(faceId2);
			if (face3d1 && face3d2) {
				const point1 = face3d1.getPoint(closestPoint1);
				const point2 = face3d2.getPoint(closestPoint2);

				// Create dashed line material
				const dashLineMaterial = new THREE.LineDashedMaterial({
					color: 0xff0000,
					dashSize: 0.5,
					gapSize: 0.25,
					linewidth: 1,
					scale: 1,
					opacity: 1.0,
					transparent: true,
					depthTest: false,   // ensures it draws on top
					depthWrite: false,
				});

				const pointsOfEdgeConnection = getConnectionInAdjList(faceId1, faceId2);
				const point1Line3d = face3d1.getPoint(pointsOfEdgeConnection.edgeIdOfMyFace);
				const point2Line3d = face3d1.getPoint((pointsOfEdgeConnection.edgeIdOfMyFace + 1n) % face3d1.N);

				// Create line geometry
				const lineGeometry = new THREE.BufferGeometry().setFromPoints([
					new THREE.Vector3(point1Line3d.x, point1Line3d.y, point1Line3d.z),
					new THREE.Vector3(point2Line3d.x, point2Line3d.y, point2Line3d.z),
				]);

				// Create the line
				const dashLine = new THREE.Line(lineGeometry, dashLineMaterial);
				// Make sure dashed effect is calculated
				dashLine.computeLineDistances();

				// Optional: Render on top of everything
				dashLine.renderOrder = 999;
				dashLine.name = 'foldIllustrationLine';

				// Remove any existing 'foldIllustrationLine'
				const existingLine = SceneManager.getScene().getObjectByName('foldIllustrationLine');
				if (existingLine) {
					SceneManager.getScene().remove(existingLine);
					(existingLine as THREE.Line).geometry.dispose();

					// Dispose of old material(s)
					if (Array.isArray((existingLine as THREE.Line).material)) {
					((existingLine as THREE.Line).material as THREE.Material[]).forEach(mat => mat.dispose());
					} else {
					((existingLine as THREE.Line).material as THREE.Material).dispose();
					}
				}

				// Finally, add the new line
				SceneManager.getScene().add(dashLine);
			}

		} else if (foldButtonState.state.step === 3) {
			raycaster.setFromCamera(mouse, cameraManager.getCamera());
			const intersects = raycaster.intersectObjects(SceneManager.getFaceObjects());

			if (intersects.length > 0) {

				const intersect = intersects[0];
				const object3dHit = intersect.object;
				const point = createPoint3D(
					intersect.point.x,
					intersect.point.y,
					intersect.point.z
				);
				raySphere.position.set(point.x, point.y, point.z);

				const face3d = SceneManager.getFace3D(object3dHit);
				if (face3d === undefined) {
					return;
				}

				// here is where we do the mismatch
				input.updateFoldState({
					...foldButtonState.state,
					point1Id: faceId1,
					point2Id: faceId2,
					faceId: face3d.ID,
					step: 4
				});

				// Verify the state update by getting the current state
				const currentState = input.getFoldButtonState();

				// Show angle popup
				const anglePopup = document.querySelector('.angle-popup');
				if (anglePopup) {
					(anglePopup as HTMLElement).style.display = 'block';
					(anglePopup as HTMLElement).style.left = event.clientX + 'px';
					(anglePopup as HTMLElement).style.top = event.clientY + 'px';
				}
			}

		}
		// current issue: all faces are being captured, i'm crossing the boundary
	}
}

document.getElementById('confirm-fold')?.addEventListener('click', activateFoldStep);

async function activateFoldStep() {
	const foldButtonState = input.getFoldButtonState();
	const foldAngleInput = document.getElementById("fold-angle") as HTMLInputElement;
	const foldAngle: number = parseFloat(foldAngleInput.value) || 90;

	// Remove illustration line
	const existingLine = SceneManager.getScene().getObjectByName('foldIllustrationLine');
	if (existingLine) {
		SceneManager.getScene().remove(existingLine);
		(existingLine as THREE.Line).geometry.dispose();
		if (Array.isArray((existingLine as THREE.Line).material)) {
			((existingLine as THREE.Line).material as THREE.Material[]).forEach(mat => mat.dispose());
		} else {
			((existingLine as THREE.Line).material as THREE.Material).dispose();
		}
	}

	if (!getIsSplittingInsteadOfMerging()) {
		// ie we are actually merging, so we do that
		// First create the split, again note mismatch
		const result = await updateExistingMultiFold(
			foldButtonState.state.point1Id,
			foldButtonState.state.point2Id,
			foldButtonState.state.faceId,
			BigInt(foldAngle)
		);

		// Log all face IDs
		const allFaces = SceneManager.getFaceObjects();

		if (typeof result === 'string') {
			addlogfeedMessage("red", "Error: ", result);
		}
	} else {
		// First create the split
		const result = await createMultiFoldBySplitting(
			foldButtonState.state.point1Id,
			foldButtonState.state.point2Id,
			foldButtonState.state.faceId,
			foldButtonState.state.stationaryPoint,
			BigInt(foldAngle)
		);

		// Log all face IDs
		const allFaces = SceneManager.getFaceObjects();

		if (typeof result === 'string') {
			addlogfeedMessage("red", "Error: ", result);
		}
	}


	// Reset the fold state
	input.resetFoldButton();
	input.resetFoldAngleState();
}






/**
 *
 * @returns the id of the closest point after shooting a raycast from mouse at camera
 */
function getClosestPointViaRaycast() : [bigint, bigint] {
	raycaster.setFromCamera(mouse, cameraManager.getCamera());
	raycaster.layers.set(0);
	const intersects = raycaster.intersectObjects(SceneManager.getFaceObjects());

	// find the closest annotation point to the mouse click
	const intersect = intersects[0];

	const object3dHit = intersect.object;
	const point = intersect.point;
	raySphere.position.set(point.x, point.y, point.z);

	const face3d = SceneManager.getFace3D(object3dHit);

	if (face3d === undefined) {
		console.error("face 3d id doesn't exists");
		return [-1n, -1n];
	}

	const closestPointId = face3d.findNearestPoint(createPoint3D(point.x, point.y, point.z));
	return [closestPointId, face3d.ID];
}


/**
 * Projects a point to the nearest edge if it's close enough
 * @param point The point to project
 * @param face3d The face containing the point
 * @param faceId The ID of the face
 * @returns The Point3D object (either the original one or the projected one)
 */
function projectAndCreateEdgePoint(
    point: Point3D,
    face3d: Face3D,
): [Point3D, bigint] {
    const closestEdgeId = face3d.findNearestEdge(point);
    const projectedPoint = face3d.projectToEdge(point, closestEdgeId);

    if (projectedPoint === undefined) {
        return [point, -1n];
    }

    if (distance(projectedPoint, point) < 0.5) {
        return [projectedPoint, closestEdgeId];
    }

    // If point is not close enough to edge, return the original point ID
    return [point, -1n];
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