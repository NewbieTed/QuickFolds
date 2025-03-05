import * as THREE from 'three';
import * as SceneManager from "../SceneManager.js";
import {CameraManager} from "../CameraManager.js";
import { displayAnnotations } from '../../controller/Controller.js';

let curStep = 1n;
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
      if (curStep === 1n) {
        playNextStep1();
      } else if (curStep === 2n) {
        playNextStep2();
        console.log("curStep32232323323333");
      } else if (curStep === 3n) {
        playNextStep3();
      }
      console.log("curStep", curStep);
      curStep = curStep + 1n;
  });
}

async function playPrevStep() {
    console.log("playPrevStep");
    const result : string | true = await displayAnnotations(curStep, curStep - 1n, isForward);
    if (result !== true) {
      console.error("Error playing previous step:", result);
    }
}

async function playNextStep1() {
    console.log("playNextStep1");
    const result : string | true = await displayAnnotations(curStep, curStep + 1n, isForward);
    if (result !== true) {
      console.error("Error playing next step:", result);
    }
}

async function playNextStep2() {
  console.log("playNextStep2");
  const result2 : string | true = await displayAnnotations(curStep, curStep + 1n, isForward);
}

async function playNextStep3() {
  console.log("playNextStep3");
  const result3 : string | true = await displayAnnotations(curStep, curStep + 1n, isForward);
}

function animate() {
	SceneManager.updateAnimations();

  renderer.render(
    SceneManager.getScene(),
		cameraManager.getCamera()
  );
}

renderer.setAnimationLoop(animate);




