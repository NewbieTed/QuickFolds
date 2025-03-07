/**
 * @fileoverview File is designed to store if keys/mouse buttons are pressed.
 */

import {TOGGLE_FOCAL_PT_KEY} from './globalSettings.js';
import { Point3D } from "../../geometry/Point.js";
import * as SceneManager from "../SceneManager.js";
import * as THREE from 'three';

let isFoldingInsteadOfMerging = true;
let isFocalPointVisible = true;
let isShiftKeyPressed = false;
let isLeftMousePressed = false;
let isPickPointButtonPressed = false;
let isDeletePointButtonPressed = false;
let isFoldButtonPressed = false;
let foldState = {
    point1Id: -1n,
    point2Id: -1n,
    faceId: -1n, // the id of the face that is split into two
    stationaryPoint: null as Point3D | null, // provide a point that is stationary in case of movement in future
    step: 0  // 0: not started, 1: going to select first point, 2: second point, 3: stationary point
};

let isFoldAngleConfirmed = false;
let foldAngleValue = 0n;


// Set up event listeners for buttons and other actions.
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const pickPointButton = document.getElementById('pick-point-button');
if (pickPointButton !== null) {
  pickPointButton.addEventListener('click', () => {
    isPickPointButtonPressed = true;
  });
}

const deletePointButton = document.getElementById('delete-point-button');
if (deletePointButton !== null) {
  deletePointButton.addEventListener('click', () => {
    isDeletePointButtonPressed = true;
  });
}

const confirmFoldButton = document.getElementById('confirm-fold');
if (confirmFoldButton) {
    confirmFoldButton.addEventListener('click', () => {
        const angleInput = document.getElementById('fold-angle') as HTMLInputElement;
        if (angleInput) {
            const angleValue = angleInput.value || '0';
            foldAngleValue = BigInt(Math.round(Number(angleValue))); // Round to nearest integer
            isFoldAngleConfirmed = true;

            console.log("Getting fold angle state immediately after click:", {
              isConfirmed: isFoldAngleConfirmed,
              angle: foldAngleValue
            });

            // Hide the angle popup
            const anglePopup = document.querySelector('.angle-popup');
            if (anglePopup) {
                (anglePopup as HTMLElement).style.display = 'none';
            }

            // remove the illustration line
            // const existingLine = SceneManager.getScene().getObjectByName('foldIllustrationLine');
            // if (existingLine) {
            //     SceneManager.getScene().remove(existingLine);
            //     (existingLine as THREE.Line).geometry.dispose();
            //     if (Array.isArray((existingLine as THREE.Line).material)) {
            //         ((existingLine as THREE.Line).material as THREE.Material[]).forEach(mat => mat.dispose());
            //     } else {
            //         ((existingLine as THREE.Line).material as THREE.Material).dispose();
            //     }
            // }

            // confirmButtonPressed(foldAngleValue);

            // Debug log after state is updated
            console.log("State updated - Angle:", foldAngleValue, "Confirmed:", isFoldAngleConfirmed);
        }
    });
}

//--------------------------- Event Listener Implementations ------------------------------------//




let doubleButtonPressedVar = false;
let secondPressVar = false;

document.getElementById('add-line-button')?.addEventListener('click', () => {
  doubleButtonPressedVar = true;
  secondPressVar = false;
  addLineState = true;
});

document.getElementById('del-line-button')?.addEventListener('click', () => {
  doubleButtonPressedVar = true;
  secondPressVar = false;
  deleteLineState = true;
});

const foldButton = document.getElementById('fold-button');
if (foldButton !== null) {
  foldButton.addEventListener('click', () => {
    isFoldingInsteadOfMerging = true;
    isFoldButtonPressed = true;
    foldState.step = 1;
  });
}


const foldButtonMerge = document.getElementById('fold-split-faces-button');
if (foldButtonMerge !== null) {
  foldButtonMerge.addEventListener('click', () => {
    isFoldingInsteadOfMerging = false;
    isFoldButtonPressed = true;
    foldState.step = 1;
  });
}

let addLineState = false;
let deleteLineState = false;

export function getIsSplittingInsteadOfMerging() {
  return isFoldingInsteadOfMerging;
}


export function getAddLineButton() {
  return addLineState
}

export function getDeleteLineButton() {
  return deleteLineState;
}

/**
 * Gets the state of the fold button.
 * @returns The state of the fold button.
 */
export function getFoldButtonState() {
  return {
      isPressed: isFoldButtonPressed,
      state: foldState
  };
}

// getter method to see if the "add annotation line" button is pressed
export function doubleButtonPressed1st() {
  return doubleButtonPressedVar;
}

export function doubleButtonPressed2nd() {
  return secondPressVar;
}

export function startSecondPress() {
  secondPressVar = true;
}

export function resetDoubleButtonPressed() {
  doubleButtonPressedVar = false;
  secondPressVar = false;
  deleteLineState = false;
  addLineState = false;
}


// dom function that activates when a mouse button is pressed
function onMouseDown(event: MouseEvent) {
  if (event.button === 0) {  // 0 is LMB
    isLeftMousePressed = true;
  }
}

// dom function that activates when a mouse button is released
function onMouseUp(event: MouseEvent) {
  if (event.button === 0) {  // 0 is LMB
    isLeftMousePressed = false;
  }
}

// dom function that activates when a key button is pressed
function onKeyDown(event: KeyboardEvent) {
  if (event.shiftKey) {
    isShiftKeyPressed = true;
  }
  if (event.key === TOGGLE_FOCAL_PT_KEY) {
    isFocalPointVisible = !isFocalPointVisible;
  }
}

// dom function that activates when a key button is released
function onKeyUp(event: KeyboardEvent) {
  if (!event.shiftKey) {
    isShiftKeyPressed = false;
  }
}

//-------------------- Accessors/Mutators for Key and Property States ---------------------------//



/**
 * Checks whether the focal point which the camera looks at is visible.
 * @returns True if the focal point is visible, false otherwise.
 */
export function getIsFocalPointVisible(): boolean {
  return isFocalPointVisible;
}

/**
 * Checks whether the shift key is pressed
 * @returns True if the shift key is pressed, false otherwise.
 */
export function getIsShiftKeyPressed(): boolean {
  return isShiftKeyPressed;
}

/**
 * Checks whether the left mouse button is pressed
 * @returns True if the LMB is pressed, false otherwise.
 */
export function getIsLeftMousePressed(): boolean {
  return isLeftMousePressed;
}

/**
 * Checks whether the pick point button is pressed.
 * @returns True if the pick point button is pressed, false otherwise.
 */
export function getIsPickPointButtonPressed(): boolean {
  return isPickPointButtonPressed;
}

/**
 * Checks whether the delete point button is pressed.
 * @returns True if the delete point button is pressed, false otherwise.
 */
export function getIsDeletePointButtonPressed(): boolean {
  return isDeletePointButtonPressed;
}

/**
 * Resets the state of the pick point button to unpressed.
 */
export function resetIsPickPointButtonPressed(): void {
  isPickPointButtonPressed = false;
}

/**
 * Resets the state of the delete point button to unpressed.
 */
export function resetIsDeletePointButtonPressed(): void {
  isDeletePointButtonPressed = false;
}


/**
* Updates the state of the fold button.
* @param newState The new state of the fold button.
*/
export function updateFoldState(newState: typeof foldState) {
    foldState = { ...newState };  // Create a new object to ensure state update
    console.log("Updated fold state:", foldState); // Debug log
}

/**
* Resets the state of the fold button to unpressed.
*/
export function resetFoldButton() {
  isFoldButtonPressed = false;
  foldState = {
      point1Id: -1n,
      point2Id: -1n,
      faceId: -1n,
      stationaryPoint: null,
      step: 0
  };
}

export function resetFoldButtonPressed() {
  isFoldButtonPressed = false;
}

/**
* Gets the state of the fold angle.
* @returns The state of the fold angle.
*/
export function getFoldAngleState() {
    return {
        isConfirmed: isFoldAngleConfirmed,
        angle: foldAngleValue
    };
}

/**
* Resets the state of the fold angle.
*/
export function resetFoldAngleState() {
  isFoldAngleConfirmed = false;
  foldAngleValue = 0n;
}