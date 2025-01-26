import * as THREE from 'three';

let isShiftKeyPressed = false;
let isMiddleMousePressed = false;

let prevMouseXPos = null;
let prevMouseYPos = null;

let diffX = 0;
let diffY = 0;

let camRotatePt = new THREE.Vector3(0, 0, 0);


const UP_DIRECTION = new THREE.Vector3(0, 1, 0);

document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const geometry = new THREE.PlaneGeometry(5, 5);
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const plane = new THREE.Mesh( geometry, material );
plane.material.side = THREE.DoubleSide;


scene.add( plane );
plane.rotateX(90);
camera.position.z = 5;


function onMouseDown(event) {
	if (event.button === 0) {  // 0 is LMB
			isMiddleMousePressed = true;
	}
}


function onMouseUp(event) {
	if (event.button === 0) {  // 0 is LMB
			isMiddleMousePressed = false;
			prevMouseXPos = null;
			prevMouseYPos = null;
	}
}

function onKeyDown(event) {
  if (event.shiftKey) {
    isShiftKeyPressed = true;

  }
}

function onKeyUp(event) {
  if (!event.shiftKey) {
    isShiftKeyPressed = false;
  }
}




document.onmousemove = (event) => {
	if (isMiddleMousePressed) {
		let currentXPos = event.clientX * 100 / window.innerWidth;
		let currentYPos = event.clientY * 100 / window.innerHeight;

		if (prevMouseXPos != null && prevMouseYPos != null) {
			diffX = currentXPos - prevMouseXPos;
			diffY = currentYPos - prevMouseYPos;
		}

		prevMouseXPos = currentXPos;
		prevMouseYPos = currentYPos;
	}
}

let groundAngle = 0;
let upperAngle = 0;

let distance = 5;
function animate() {
	if (isShiftKeyPressed) {
		let forwardDirection = new THREE.Vector3();
		camera.getWorldDirection(forwardDirection);
		let xzProjectNormalized = new THREE.Vector3(forwardDirection.x, 0, forwardDirection.z).normalize();
		let forwardVector = xzProjectNormalized.multiplyScalar(diffY * 	-0.5);

		// compute direction.right vector
		let rightVector = new THREE.Vector3().crossVectors(UP_DIRECTION, forwardDirection);
		rightVector.normalize().multiplyScalar(diffX * -0.5);

		camRotatePt.add(forwardVector).add(rightVector);
		console.log("movehapen");
	} else {
		groundAngle += diffX * 0.1;
		upperAngle += diffY * 0.01;
		console.log("happen stop");
	}




	camera.position.copy(camRotatePt).add(new THREE.Vector3(distance * Math.sin(groundAngle),  distance * Math.sin(upperAngle), distance * Math.cos(groundAngle)));
	camera.lookAt(camRotatePt);

	 diffX = 0;
	 diffY = 0;

	renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );





