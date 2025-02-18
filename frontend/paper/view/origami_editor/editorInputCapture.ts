/**
 * @fileoverview File is designed to store if keys/mouse buttons are pressed.
 */

import {TOGGLE_FOCAL_PT_KEY} from './globalSettings';


let isFocalPointVisible = true;
let isShiftKeyPressed = false;
let isLeftMousePressed = false;
let isPickPointButtonPressed = false;
let isDeletePointButtonPressed = false;


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