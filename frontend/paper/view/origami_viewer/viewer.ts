import * as THREE from 'three';
import * as SceneManager from "../SceneManager.js";
import {CameraManager} from "../CameraManager.js";
import { displayAnnotations } from '../../controller/Controller.js';

let curStep = 0n;
let isForward = true;



// Create the renderer.
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the scene
SceneManager.initialize(renderer);
const cameraManager = new CameraManager(SceneManager.getScene());


const prevStepButton = document.getElementById('prev-step-button');
if (prevStepButton !== null) {
    prevStepButton.addEventListener('click', () => {
      isForward = false;
      if (curStep < 1n) {
        curStep = 1n;
      } else {
        playPrevStep();
        curStep = curStep - 1n;
      }
  });
}

const nextStepButton = document.getElementById('next-step-button');
if (nextStepButton !== null) {
    nextStepButton.addEventListener('click', () => {
      isForward = true;
      playNextStep();
      console.log("curStep", curStep);
      curStep = curStep + 1n;
  });
}

/**
 * plays the previous step of an animation
 */
async function playPrevStep() {
    console.log("playPrevStep");
    const result : string | true = await displayAnnotations(curStep, curStep - 1n, isForward);
    if (result !== true) {
      console.error("Error playing previous step:", result);
    }
}

/**
 * plays the next step in the animation
 */
async function playNextStep() {
    console.log("playNextStep");
    const result : string | true = await displayAnnotations(curStep, curStep + 1n, isForward);
    if (result !== true) {
      console.error("Error playing next step:", result);
    }
}

const pauseButton = document.getElementById('pause');
if (pauseButton !== null) {
  pauseButton.addEventListener('click', pauseAction)
}
/**
 * stops/reactivates the faces when called
 */
async function pauseAction() {

}

const sliderButton = document.getElementById('playbackSpeed');
if (sliderButton !== null) {
  sliderButton.addEventListener("input", changePlaybackSpeed);
}
async function changePlaybackSpeed() {
  // this.value gives u the playback speed: [0.1 to 1] as a string
}


// animates faces
function animate() {
	SceneManager.updateAnimations();

  renderer.render(
    SceneManager.getScene(),
		cameraManager.getCamera()
  );
}

renderer.setAnimationLoop(animate);




