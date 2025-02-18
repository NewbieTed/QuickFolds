/**
 * File is designed to store if keys/mouse buttons are pressed
 * Try to keep simple event input modularized with this file
 */

import {SHOW_LOOK_AT_PT_KEY} from './globalSettings.js';

let isRotateSphereVisible = true;
let isShiftKeyPressed = false;
let isLeftMousePressed = false;
let isPickPointButtonPressed = false;
let isDeletePointButtonPressed = false;


document.addEventListener('mouseup', onMouseUp);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
document.getElementById('pick-point-button').addEventListener('click', () => {
  isPickPointButtonPressed = true;
});
document.getElementById('delete-point-button').addEventListener('click', () => {
  isDeletePointButtonPressed = true;
});


let doubleButtonPressedVar = false;
let secondPressVar = false;

document.getElementById('add-line-button').addEventListener('click', () => {
  doubleButtonPressedVar = true;
  secondPressVar = false;
  addLineState = true;
});

document.getElementById('del-line-button').addEventListener('click', () => {
  doubleButtonPressedVar = true;
  secondPressVar = false;
  deleteLineState = true;
});

let addLineState = false;
let deleteLineState = false;

export function getAddLineButton() {
  return addLineState
}

export function getDeleteLineButton() {
  return deleteLineState;
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




// getter method to see if the sphere the camera looks at is visible
function getIsRotateSphereVisible() {
  return isRotateSphereVisible;
}

// getter method to see if the sphere the shift key is pressed
function getIsShiftKeyPressed() {
  return isShiftKeyPressed;
}

// getter method to see if the sphere the LMB is pressed
function getIsLeftMousePressed() {
  return isLeftMousePressed;
}

// getter method to see if the "pick a point" button is pressed
function getIsPickPointButtonPressed() {
  return isPickPointButtonPressed;
}

// getter method to see if the "delete a point" button is pressed
function getIsDeletePointButtonPressed() {
  return isDeletePointButtonPressed;
}


// reset after picking a point
function resetIsPickPointButtonPressed() {
  isPickPointButtonPressed = false;
}

// reset after deleting a point
function resetIsDeletePointButtonPressed() {
  isDeletePointButtonPressed = false;
}



// dom function that activates when a mouse button is pressed
function onMouseDown(event) {
  if (event.button === 0) {  // 0 is LMB
    isLeftMousePressed = true;
  }
}

// dom function that activates when a mouse button is released
function onMouseUp(event) {
  if (event.button === 0) {  // 0 is LMB
    isLeftMousePressed = false;
  }
}

// dom function that activates when a key button is pressed
function onKeyDown(event) {
  if (event.shiftKey) {
    isShiftKeyPressed = true;
  }
  if (event.key === SHOW_LOOK_AT_PT_KEY) {
    isRotateSphereVisible = !isRotateSphereVisible;
  }
}

// dom function that activates when a key button is released
function onKeyUp(event) {
  if (!event.shiftKey) {
    isShiftKeyPressed = false;
  }
}





export {getIsRotateSphereVisible, getIsShiftKeyPressed, getIsLeftMousePressed, getIsPickPointButtonPressed, resetIsPickPointButtonPressed, getIsDeletePointButtonPressed, resetIsDeletePointButtonPressed};