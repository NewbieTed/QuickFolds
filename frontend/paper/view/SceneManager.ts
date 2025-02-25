/**
 * @fileoverview This file manages the collection of Three.js objects being
 * rendered for the currently open origami. It is the single point of entry
 * from which callers can change the actually rendered paper, offering key
 * animation methods to display the 3D-rendered paper in motion.
 */


import * as THREE from 'three';
import {createPoint3D} from '../geometry/Point';
import {Face3D} from "../geometry/Face3D";
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createNewGraph } from '../model/PaperGraph';
import { Animation } from './animation/Animation';
import { FlipAnimation } from './animation/FlipAnimation';

let stepID = 1n;
const origamiID = localStorage.getItem("currentOrigamiIdForEditor");
if (origamiID === null) {
    throw new Error("The ID of the current origami is null.");
}

let nextFaceId: bigint = 0n;
const scene = new THREE.Scene();
let animations: Animation[] = [];
const idsToFace3D = new Map<bigint, Face3D>();
const idsToFaceObj = new Map<bigint, THREE.Object3D>();
const threeIDtoFaceID = new Map<number, bigint>();

export function print3dGraph() {
    console.log(idsToFace3D);
}


/**
 * Initialize the scene with a plane, point light, etc.
 * @param renderer: The renderer that will render this scene.
 */
export function initialize(renderer: THREE.WebGLRenderer) {

    idsToFace3D.clear();
    idsToFaceObj.clear();
    threeIDtoFaceID.clear();

    // Set up environment for proper lighting.
    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(environment).texture;
    environment.dispose();

    // Create visual axes/grid.
    const grid = new THREE.GridHelper(10, 10);
    scene.add(grid);

    // Add a point light to be able to see things.
    const pointLight = new THREE.PointLight(0xffffff, 0.25, 0, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create a Face3D to begin manipulating.
    const vertices3D = [
        createPoint3D(-3, 0, -3, "Vertex"),
        createPoint3D(-3, 0, 3, "Vertex"),
        createPoint3D(3, 0, 3, "Vertex"),
        createPoint3D(3, 0, -3, "Vertex"),
    ]
    const principalNormal = createPoint3D(0, 1, 0);
    const plane = new Face3D(vertices3D, 0.05, 0, principalNormal, 0n);
    scene.add(plane.getFaceObject());

    idsToFace3D.set(plane.ID, plane);
    idsToFaceObj.set(plane.ID, plane.getFaceObject());
    threeIDtoFaceID.set(plane.getFaceObject().id, plane.ID);
    createNewGraph(0n);
}

/**
 * Gets the current scene being rendered.
 */
export function getScene(): THREE.Scene {
    return scene;
}

/**
 * Gets a collection of meshes for all the face objects in the scene.
 * This does not include annotation geometry - only the polygon meshes.
 */
export function getFaceObjects(): THREE.Object3D[] {
    return Array.from(idsToFaceObj.values());
}

/**
 * Gets the id of the next available face, also updates the counter.
 * @returns The id of the new face.
 */
export function getNextFaceID(): bigint {
    nextFaceId += 1n;
    return nextFaceId - 1n;
}

/**
 * Given a Three.js object, return the ID of the Face3D object, if it exists.
 * @param threeJSObj The Three.js mesh corresponding to the Face3D.
 * @returns The ID of the Face3D object if it exists, or undefined if not.
 */
export function getFaceID(threeJSObj: THREE.Object3D): bigint | undefined {
    return threeIDtoFaceID.get(threeJSObj.id);
}

/**
 * Given a Three.js object, return the Face3D object, if it exists.
 * @param threeJSObj The Three.js mesh corresponding to the Face3D.
 * @returns The Face3D object if it exists, or undefined if not.
 */
export function getFace3D(threeJSObj: THREE.Object3D): Face3D | undefined {
    const faceID: bigint | undefined = threeIDtoFaceID.get(threeJSObj.id);
    if (faceID === undefined) {
        return undefined;
    }
    return idsToFace3D.get(faceID);
}

/**
 * Gets a Face3D object in the current scene via its ID.
 * @param faceID ID of the Face3D to get.
 * @returns Face3D object or undefined if no Face3D with given ID exists.
 */
export function getFace3DByID(faceID: bigint) {
    return idsToFace3D.get(faceID);
}

/**
 * Gets the current step ID we are on. Does not update the step counter.
 * @returns The current step ID.
 */
export function getStepID() {
    return stepID;
}

/**
 * Gets the ID of the origami currently open.
 * @returns The ID of the current origami.
 */
export function getOrigamiID() {
    return origamiID;
}

/**
 * Increases the step counter.
 */
export function incrementStepID() {
    stepID++;
}

/**
 * Adds a Face3D to the scene.
 * @param face The Face3D to add to the scene.
 */
export function addFace(face: Face3D) {

    // Add the face to the scene.
    scene.add(face.getPivot());

    // Add it to the id maps.
    idsToFace3D.set(face.ID, face);
    idsToFaceObj.set(face.ID, face.getFaceObject());
    threeIDtoFaceID.set(face.getFaceObject().id, face.ID);
}

/**
 * Deletes the Face3D with the given ID from the scene.
 * @param faceID The ID of the face to delete.
 * @throws Error if the face with the given ID does not exist.
 */
export function deleteFace(faceID: bigint) {

    const face: Face3D | undefined = getFace3DByID(faceID);
    if (face === undefined) {
        throw new Error(`No Face3D with ID ${faceID} exists.`);
    }

    // Remove the face from the scene.
    const faceMeshID = face.getFaceObject().id;
    scene.remove(face.getPivot());

    // Clean up the face properly.
    face.dispose();

    // Remove from maps.
    idsToFace3D.delete(faceID);
    idsToFaceObj.delete(faceID);
    threeIDtoFaceID.delete(faceMeshID);
}

// Test animation function.
export function spinFace() {

    // Spin the only face in the scene.
    const face: Face3D | undefined = getFace3DByID(0n);
    if (face === undefined) {
        return;
    }
    const anim = new FlipAnimation(face);
    animations.push(anim);
}

// Test animation function.
export function updateAnimations() {

    const animRemaining: Animation[] = [];

    for (const anim of animations) {
        anim.update();
        if (!anim.isComplete()) {
            animRemaining.push(anim);
        }
    }

    animations = animRemaining;
}
