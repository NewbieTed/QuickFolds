/**
 * @fileoverview This file manages the collection of Three.js objects being
 * rendered for the currently open origami. It is the single point of entry
 * from which callers can change the actually rendered paper, offering key
 * animation methods to display the 3D-rendered paper in motion.
 */


import * as THREE from 'three';
import * as pt from '../geometry/Point.js';
import {Face3D} from "../geometry/Face3D.js";
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createNewGraph } from '../model/PaperGraph.js';
import { Animation } from './animation/Animation.js';
import { FoldAnimation } from './animation/FoldAnimation.js';
import { OffsetAnimation } from './animation/OffsetAnimation.js';

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
        pt.createPoint3D(-3, 0, -3, "Vertex"),
        pt.createPoint3D(-3, 0, 3, "Vertex"),
        pt.createPoint3D(3, 0, 3, "Vertex"),
        pt.createPoint3D(3, 0, -3, "Vertex"),
    ]
    const principalNormal = pt.createPoint3D(0, 1, 0);
    // Paper thickness: 0.01
    const plane = new Face3D(vertices3D, 0.01, 0, principalNormal, 0n);
    scene.add(plane.getPivot());

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
    console.log("face objects", idsToFaceObj.values());
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


/**
 * Updates the current animations. To be called in every iteration
 * of the animation loop handled by the Three.js renderer.
 */
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


/**
 * Animates folding several faces by rotating them about the
 * crease line specified by the ID of the anchored face and the
 * ID of the edge in the anchored face which is being folded. The
 * fold is by deltaAngle, opposite to the direction of the direction
 * of the principle normal of the anchored face.
 * @param anchoredFaceID The ID of the face that doesn't move.
 * @param foldEdgeID The ID of the edge in the anchored face being folded.
 * @param deltaAngle The angle w.r.t. opposite the anchored principal normal.
 * @param faceIDs The IDs of all faces that need to rotate during the fold.
 */
export function animateFold(
                anchoredFaceID: bigint,
                foldEdgeID: bigint,
                deltaAngle: number,
                ...faceIDs: bigint[]
                ): void {

    const anchored: Face3D | undefined = getFace3DByID(anchoredFaceID);
    if (anchored === undefined) {
        throw new Error(`No Face3D with ID ${anchoredFaceID} exists.`);
    }

    // Get three points, the first two of which are on the fold edge.
    const vertex1 = anchored.getPoint(foldEdgeID);
    const vertex2 = anchored.getPoint((foldEdgeID + 1n) % anchored.N);
    const vertex3 = anchored.getPoint((foldEdgeID + 2n) % anchored.N);

    const dir12 = pt.normalize(pt.subtract(vertex2, vertex1));
    const dir23 = pt.normalize(pt.subtract(vertex3, vertex2));
    const similarity: number = pt.dotProduct(
        anchored.getPrincipleNormal(), pt.crossProduct(dir12, dir23)
    );

    let axisPoint1: pt.Point3D;
    let axisPoint2: pt.Point3D;

    if (similarity < 0) {
        // The correct direction for the Right-Hand-Rule is 1 to 2.
        axisPoint1 = vertex1;
        axisPoint2 = vertex2;
    } else if (similarity > 0) {
        // The correct direction for the Right-Hand-Rule is 2 to 1.
        axisPoint1 = vertex2;
        axisPoint2 = vertex1;
    } else {
        // This should never ever happen, as the principle normal and the
        // cross product above should be mathematically both unit vectors
        // which point exactly the same direction or opposite directions.
        throw new Error("Could not determine which direction to animate fold!");
    }

    // Collect the faces to rotate.
    const faces: Face3D[] = [];
    for (const faceID of faceIDs) {
        const face: Face3D | undefined = getFace3DByID(faceID);
        if (face === undefined) {
            throw new Error(`No Face3D with ID ${faceID} exists.`);
        }
        faces.push(face);
    }

    // Now create the animation and run it!
    const anim = new FoldAnimation(axisPoint1, axisPoint2, deltaAngle, ...faces);
    animations.push(anim);
}


// Animates the offset of several faces given a map of face ids to the change in offset.
export function animateOffset(offsets: Map<bigint, number>): void {

    const anim = new OffsetAnimation(offsets);
    animations.push(anim);
}