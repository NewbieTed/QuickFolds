/**
 * File is designed to run the main rendering for the editor.
 */


import * as THREE from 'three';
import {getIsPickPointButtonPressed, resetIsPickPointButtonPressed, getIsDeletePointButtonPressed, resetIsDeletePointButtonPressed} from './editorInputCapture.ts';
import {RETURN_TO_ORIGIN_KEY, SWAP_CAM_TYPE_KEY, TOGGLE_FOCAL_PT_KEY	} from "./globalSettings.ts";
import {Face3D} from "../../geometry/Face3D.ts";
import {Face2D} from "../../geometry/Face2D.ts";
import {createPoint3D, createPoint2D} from "../../geometry/Point.ts";
import {CameraManager} from "../CameraManager.ts"


document.addEventListener('keydown', onKeyDown);
document.addEventListener('mousedown', onMouseDown);

let faces = []; // field to store all face objects

// Creating the scene to edit in.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Set up environment for proper lighting.
const environment = new RoomEnvironment();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(environment).texture;
environment.dispose();

// Create camera for the scene.
const cameraManager = new CameraManager(scene);

 // Create raycaster.
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();


// Handle window resizing.
window.addEventListener('resize', () => {

	cameraManager.resizeWindow();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log("Window resized: Updated camera & renderer");

});


// Create visual axes/grid.
const grid = new THREE.GridHelper(10, 10);
scene.add(grid);


// --------------------- Visual Test for Face3D and Face2D --------------------

// Create a Face3D
const vertices3D = [
	createPoint3D(0, 0, 0, "Vertex"),
	createPoint3D(-1, 0, 2.5, "Vertex"),
	createPoint3D(2, 0, 4, "Vertex"),
	createPoint3D(4, 0, 2, "Vertex"),
	createPoint3D(3, 0, 0, "Vertex")
]
const principalNormal = createPoint3D(0, 1, 0);
const myFace3D = new Face3D(vertices3D, 0.1, 0, principalNormal);

// Create the corresponding Face2D
const vertices2D = [
	createPoint2D(0, 0, "Vertex"),
	createPoint2D(-1, 2.5, "Vertex"),
	createPoint2D(2, 4, "Vertex"),
	createPoint2D(4, 2, "Vertex"),
	createPoint2D(3, 0, "Vertex")
]
const myFace2D = new Face2D(vertices2D);

// Naive conversion between 2D and 3D annotations which will work
// in this case. Usually we have to do some math to get this right.
function convertAnnotations(update2D) {

	const pointsAdded = new Map();

	// Basically copy everything and insert 0 as the middle coordinate.
	for (const pointID of update2D.pointsAdded.keys()) {
		const anotPt = update2D.pointsAdded.get(pointID);
		pointsAdded.set(pointID, {
			point: createPoint3D(anotPt.point.x, 0, anotPt.point.y), 
			edgeID: anotPt.edgeID
		});
	}

	const update3D = {
		pointsAdded: pointsAdded,
		pointsDeleted: update2D.pointsDeleted,
		linesAdded: update2D.linesAdded,
		linesDeleted: update2D.linesDeleted
	}

	return update3D
}

// Add some annotations to the Face2D, and automatically
// add them to the Face3D via the update objects.
let update = myFace2D.addAnnotatedPoint(createPoint2D(1, 1));
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedPoint(createPoint2D(1, 2));
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedPoint(createPoint2D(2.5, 1));
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedPoint(createPoint2D(2, 3));
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedLine(0n, 5n);
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedLine(5n, 3n);
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedLine(5n, 1n);
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedLine(2n, 4n);
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedLine(6n, 3n);
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedLine(7n, 8n);
myFace3D.updateAnnotations(convertAnnotations(update));

update = myFace2D.addAnnotatedLine(7n, 8n);
myFace3D.updateAnnotations(convertAnnotations(update));
console.log(update.status)
// Indicates bad line due to overlap! (line from pt 7 to pt 8 added twice.)
// The returned update object is empty so nothing changes in the Face3D.


// Add the Face3D to the scene.
for (const object of myFace3D.collectObjects()) {
	scene.add(object);
}
// For raycasting.
faces.push(myFace3D.getFaceMesh());

// -------------------- End of Test for Face3D and Face2D ---------------------


// Add a point light to be able to see things.
const pointLight = new THREE.PointLight(0xffffff, 0.25, 0, 1);
pointLight.position.set(0, 10, 10);
scene.add(pointLight);
scene.add(new THREE.PointLightHelper(pointLight, 2, 0xffff00));


// raycast test pt
const raycastSphere = new THREE.SphereGeometry(0.05);
const blueMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const raySphere = new THREE.Mesh(raycastSphere, blueMaterial);
raySphere.visible = true;
scene.add(raySphere);


// Handle key pressing.
function onKeyDown(event) {

	if (event.key === RETURN_TO_ORIGIN_KEY) {
    	cameraManager.returnToOrigin();
  	} else if (event.key === SWAP_CAM_TYPE_KEY) {
    	cameraManager.swapCameraType();
  	} else if (event.key === TOGGLE_FOCAL_PT_KEY) {
		cameraManager.toggleFocalPointVisible();
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

		raycaster.setFromCamera(mouse, cameraManager.getCamera());
		const intersects = raycaster.intersectObjects(faces);

		if (intersects.length > 0) {
			const intersect = intersects[0];
			const point = intersect.point;
			raySphere.position.set(point.x, point.y, point.z);
			console.log(`Clicked coordinates: x=${point.x.toFixed(2)}, y=${point.y.toFixed(2)}, z=${point.z.toFixed(2)}`);

			resetIsPickPointButtonPressed(); // Reset after picking
		}

	} else if (getIsDeletePointButtonPressed()) {

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 0.97;

        raycaster.setFromCamera(mouse, cameraManager.getCamera());
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


// runs every animation frame
// similar to SetInterval, but less computationally expensive for Three.js
function animate() {

	if (getIsPickPointButtonPressed()) {
		cameraManager.lockMovement();
	} else {
		cameraManager.unlockMovement();
	}

	renderer.render(scene, cameraManager.getCamera());

}

renderer.setAnimationLoop(animate);