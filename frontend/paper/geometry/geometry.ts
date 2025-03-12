/**
 * @fileoverview Implementation of useful geometric operations,
 * such as solving linear systems or change of basis.
 */


import {Face3D} from "./Face3D.js"
import * as pt from "./Point.js"
import * as SceneManager from "../view/SceneManager.js"
import * as THREE from 'three';
import { Face2D } from "./Face2D.js";

/**
 * Represents an orthonomormal basis for a plane in 3D space. Specified
 * by a point in the plane, the unit normal vector to the plane, and two
 * orthogonal unit basis vectors inside the plane itself. This gives a
 * complete coordinate system in 3D space, where the given point acts as
 * the origin of that coordinate system.
 */
export type PlaneBasis3D = {
    readonly origin: pt.Point3D,
    readonly normal: pt.Point3D,
    readonly axis1: pt.Point3D,
    readonly axis2: pt.Point3D
}

/**
 * Represents an orthonomormal basis for a plane in 2D space. Specified
 * by a point in the plane, the unit normal vector to the plane, and two
 * orthogonal unit basis vectors inside the plane itself. This gives a
 * complete coordinate system in 3D space, where the given point acts as
 * the origin of that coordinate system.
 * ___
 */
export type PlaneBasis2D = {
    readonly origin: pt.Point2D,
    readonly axis1: pt.Point2D,
    readonly axis2: pt.Point2D
}

/**
 * Gets an orthonormal basis for the coordinate system whose origin
 * is at the pivot of the given Face3D, and whose plane matches the
 * underlying plane of the Face3D.
 * @param face The Face3D to get a basis for.
 * @returns The plane basis whose:
 *            - origin is the given face's pivot (centroid),
 *            - normal is the principal normal,
 *            - first axis is from the pivot to vertex 0 of the face,
 *            - second axis is orthogonal to the first and the normal
 *              via the Right Hand Rule.
 */
export function getPlaneBasis(face: Face3D): PlaneBasis3D {

    // Origin of the plane.
    const origin: pt.Point3D = pt.createPoint3D(
        face.getPivot().position.x,
        face.getPivot().position.y,
        face.getPivot().position.z,
    );

    // Principal normal.
    const normal: pt.Point3D = pt.copyPoint(face.getPrincipleNormal());

    // First axis.
    const axis1: pt.Point3D = pt.normalize(
        pt.subtract(face.vertices[0], origin)
    );

    // Second axis.
    const axis2: pt.Point3D = pt.crossProduct(normal, axis1);

    // Create the basis object.
    const basis: PlaneBasis3D = {
        origin: origin,
        normal: normal,
        axis1: axis1,
        axis2: axis2
    }

    return basis;
}


/**
 * Gets an orthonormal basis for the coordinate system whose origin
 * is at the pivot of the given Face3D, and whose plane matches the
 * underlying plane of the Face3D.
 * @param face The Face3D to get a basis for.
 * @returns The plane basis whose:
 *            - origin is the given face's pivot (centroid),
 *            - normal is the principal normal,
 *            - first axis is from the pivot to vertex 0 of the face,
 *            - second axis is orthogonal to the first and the normal
 *              via the Right Hand Rule.
 */
export function getPlaneBasis2D(face: Face2D): PlaneBasis2D {

    // Origin of the plane.
    const origin: pt.Point2D = pt.average(face.vertices);

    // Principal normal.
    const normal: pt.Point3D = pt.createPoint3D(0, 1, 0);

    // First axis.
    const axis1: pt.Point2D = pt.normalize(
        pt.subtract(face.vertices[0], origin)
    );

    // Second axis.
    const axis1_3D = pt.createPoint3D(
        axis1.x, 0, axis1.y
    );
    const axis2_3D: pt.Point3D = pt.crossProduct(normal, axis1_3D);
    const axis2: pt.Point2D = pt.createPoint2D(axis2_3D.x, axis2_3D.z);

    // Create the basis object.
    const basis: PlaneBasis2D = {
        origin: origin,
        axis1: axis1,
        axis2: axis2
    }

    return basis;
}


// Converts coordinates in a 2D plane basis to world coordinates.
export function basisToWorld2D(basis: PlaneBasis2D, coord: pt.Point2D): pt.Point2D {
    const scaledAxis1: pt.Point2D = pt.scalarMult(basis.axis1, coord.x);
    const scaledAxis2: pt.Point2D = pt.scalarMult(basis.axis2, coord.y);
    return pt.add(basis.origin, pt.add(scaledAxis1, scaledAxis2) as pt.Point2D);
}

// Converts coordinates in a 3D plane basis to world coordinates.
export function basisToWorld(basis: PlaneBasis3D, coord: pt.Point3D): pt.Point3D {
    const scaledAxis1: pt.Point3D = pt.scalarMult(basis.axis1, coord.x);
    const scaledNormal: pt.Point3D = pt.scalarMult(basis.normal, coord.y);
    const scaledAxis2: pt.Point3D = pt.scalarMult(basis.axis2, coord.z);
    const relative = pt.add(pt.add(scaledAxis1, scaledAxis2) as pt.Point3D, scaledNormal);
    return pt.add(basis.origin, relative);
}


/**
 * Given the orthonormal basis for a plane, projects a list of
 * 3D points onto that plane and gives each of their coordinates
 * with respect to this new basis.
 * @param basis The othonormal basis of the plane to project onto.
 * @param points The list of points to project.
 * @returns The list of projected points, in 2D coordinates on the plane.
 */
export function projectToPlane(
            basis: PlaneBasis3D,
            ...points: pt.Point3D[]
            ): pt.Point2D[] {

    // Use the fact that the basis is orthonormal.
    // The change of basis is very simple, because the
    // inverse of an orthogonal matrix is its transpose.
    const result: pt.Point2D[] = [];
    for (const point of points) {
        result.push(pt.createPoint2D(
            pt.dotProduct(basis.axis1, pt.subtract(point, basis.origin)),
            pt.dotProduct(basis.axis2, pt.subtract(point, basis.origin))
        ));
    }

    return result;
}

/**
 * Given the orthonormal basis for a plane, projects a list of
 * 2D points onto that plane and gives each of their coordinates
 * with respect to this new basis.
 * @param basis The othonormal basis of the plane to project onto.
 * @param points The list of points to project.
 * @returns The list of projected points, in 3D coordinates on the plane.
 */
export function projectToPlane2D(
    basis: PlaneBasis2D,
    ...points: pt.Point2D[]
    ): pt.Point3D[] {

    // Use the fact that the basis is orthonormal.
    // The change of basis is very simple, because the
    // inverse of an orthogonal matrix is its transpose.
    const result: pt.Point3D[] = [];
    for (const point of points) {
        result.push(pt.createPoint3D(
            pt.dotProduct(basis.axis1, pt.subtract(point, basis.origin)),
            0,
            pt.dotProduct(basis.axis2, pt.subtract(point, basis.origin))
        ));
    }

    return result;
}


/**
 * Projects two sets of points onto a line through the origin with given
 * direction, and then checks whether the bounding intervals of each set
 * on that line overlap. Intuitively, consider a wall with the given
 * direction through the origin, and shine a light perpendicular to that
 * wall. Consider the convex hulls of the two given sets of points. These
 * will cast shadows onto the wall; the question is whether their shadows
 * are overlapping or not.
 *
 * @param setA The first set of points.
 * @param setB The second set of points.
 * @param line The direction vector of the line to project onto.
 * @returns True of the projections of the convex hulls of set A and set B
 * onto the line intersect, and false if not.
 * @throws Error if one of the given sets is empty.
 */
export function computeShadowOverlap(
            setA: pt.Point2D[],
            setB: pt.Point2D[],
            line: pt.Point2D
            ): boolean {

    if (setA.length === 0 || setB.length === 0) {
        throw new Error("Cannot compute shadow overlap with no points!");
    }

    const direction = pt.normalize(line);

    // Relative coordinates in their projection onto the line
    // through the origin with the given direction.
    let minA: number = pt.dotProduct(setA[0], direction);
    let maxA: number = minA;
    let minB: number = pt.dotProduct(setB[0], direction);
    let maxB: number = minB;

    // Project the points, keep track of the min/max coords of the sets.
    for (const point of setA) {
        const coord = pt.dotProduct(point, direction);
        minA = Math.min(minA, coord);
        maxA = Math.max(maxA, coord);
    }
    for (const point of setB) {
        const coord = pt.dotProduct(point, direction);
        minB = Math.min(minB, coord);
        maxB = Math.max(maxB, coord);
    }

    // There are two scenarios in which the shadows overlap:
    // minA < maxB < maxA   (Set B's right end is bounded by set A)
    // minB < maxA < maxB   (Set A's right end is bounded by set B)

    return (minA < maxB && maxB < maxA) ||
           (minB < maxA && maxA < maxB);
}


/**
 * Checks if two coplanar Face3Ds intersect or not.
 * IMPORTANT: This function assumes the faces are coplanar.
 * @param faceA The first Face3D.
 * @param faceB The second Face3D.
 * @returns True if the polygons underlying the two
 * faces intersect, and false otherwise.
 */
export function computeFaceIntersection(
            faceA: Face3D,
            faceB: Face3D
        ): boolean {

    // First, assuming that these Face3D are coplanar,
    // we project them onto the 2D plane basis and obtain
    // 2D coordinates for all of the vertices. This
    // simplifies the problem to detecting whether two
    // normal old convex polygons intersect.

    // Suppose Face A has N sides, and Face B has M sides.
    // For each of these N + M different sides, compute the
    // (2D) normal vectors. Each of these vectors is a potential
    // line to project onto and check for "shadow overlap".
    // By the Separating Axis Theorem, we have that if even one
    // of the shadows do not overlap, these polygons don't intersect.
    // On the other hand, if the shadows overlap in every case,
    // the polygons must intersect.

    const basis: PlaneBasis3D = getPlaneBasis(faceA);
    const setA: pt.Point2D[] = projectToPlane(basis, ...faceA.vertices);
    const setB: pt.Point2D[] = projectToPlane(basis, ...faceB.vertices);
    const N = BigInt(setA.length);
    const M = BigInt(setB.length);

    // Check the normals for face A.
    for (let i = 0n; i < N; i++) {
        const firstVertex = setA[Number(i)];
        const secondVertex = setA[Number((i + 1n) % N)];
        const edgeDirection = pt.subtract(secondVertex, firstVertex);
        const normal = pt.createPoint2D(
            edgeDirection.y,
            edgeDirection.x * -1
        ); // Opposite reciprocal.

        // Check for shadow overlap.
        if (!computeShadowOverlap(setA, setB, normal)) {
            // Some shadow doesn't overlap; the faces are separable.
            return false;
        }
    }

    // Check the normals for face B.
    for (let i = 0n; i < M; i++) {
        const firstVertex = setB[Number(i)];
        const secondVertex = setB[Number((i + 1n) % M)];
        const edgeDirection = pt.subtract(secondVertex, firstVertex);
        const normal = pt.createPoint2D(
            edgeDirection.y,
            edgeDirection.x * -1
        ); // Opposite reciprocal.

        // Check for shadow overlap.
        if (!computeShadowOverlap(setA, setB, normal)) {
            // Some shadow doesn't overlap; the faces are separable.
            return false;
        }
    }

    // Every shadow computed overlaps; the faces must intersect.
    return true;
}


/**
 * Finds the axis for the crease line specified by the ID of the anchored
 * face during some fold and the ID of the edge in the anchored face which
 * is being folded.
 * @param anchoredFaceID The ID of the face that doesn't move.
 * @param foldEdgeID The ID of the edge in the anchored face being folded.
 * @returns The "vector" specifying the axis of rotation, from the first
 * point to the second point. An angle of rotation with respect to this axis
 * is interpreted as positive being CCW according to the right hand rule.
 * @throws Error when the direction of the fold is unresolvable. This usually
 * is an indication that the geometry is badly corrupted somehow.
 */
export function resolveFoldDirection(
            anchoredFaceID: bigint,
            foldEdgeID: bigint,
            ): [pt.Point3D, pt.Point3D] {


    const anchored = SceneManager.getFace3DByID(anchoredFaceID);
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
        throw new Error("Could not resolve fold direction.");
    }

    return [axisPoint1, axisPoint2];
}


// Does the same thing as rotateFace in Face3D but only on a given set
// points and an axis/angle.
// ___
export function rotateVertices(
            vertices: pt.Point3D[],
            axisPoint1: pt.Point3D,
            axisPoint2: pt.Point3D,
            deltaAngle: number
            ): pt.Point3D[] {

    // Compute the normalized direction vector of the axis.
    const axis: pt.Point3D = pt.normalize(
        pt.subtract(axisPoint2, axisPoint1)
    );

    // Create the translation and quaternion to be applied.
    const shift: THREE.Vector3 = new THREE.Vector3(
        axisPoint1.x, axisPoint1.y, axisPoint1.z
    );
    const q: THREE.Quaternion = new THREE.Quaternion();
    q.setFromAxisAngle(
        new THREE.Vector3(axis.x, axis.y, axis.z), deltaAngle
    );

    const result: pt.Point3D[] = [];
    // Rotate every point.
    for (let i = 0n; i < vertices.length; i++) {

        const oldVertex = vertices[Number(i)];
        const vertexVec = new THREE.Vector3(
            oldVertex.x,
            oldVertex.y,
            oldVertex.z,
        )

        vertexVec.sub(shift);
        vertexVec.applyQuaternion(q);
        vertexVec.add(shift);

        result.push(pt.createPoint3D(
            vertexVec.x, vertexVec.y, vertexVec.z, "Vertex"
        ));

    }

    return result;
}

// Does the same thing as getPlaneBasis but for a given set of vertices.
// ___
export function getPlaneBasisFromVertices(
            vertices: pt.Point3D[],
            principalNormal: pt.Point3D,
            ): PlaneBasis3D {

    // Origin of the plane.
    const origin: pt.Point3D = pt.average(vertices);

    // Normal.
    const normal: pt.Point3D = pt.copyPoint(principalNormal);

    // First axis.
    const axis1: pt.Point3D = pt.normalize(
        pt.subtract(vertices[0], origin)
    );

    // Second axis.
    const axis2: pt.Point3D = pt.crossProduct(principalNormal, axis1);

    // Create the basis object.
    const basis: PlaneBasis3D = {
        origin: origin,
        normal: principalNormal,
        axis1: axis1,
        axis2: axis2
    }

    return basis;
}


/**
 * Does the same thing as computeFaceIntersection except already given
 * the vertices in 2D.
 * ___
 */
export function faceIntersectionByVertices(
            setA: pt.Point2D[],
            setB: pt.Point2D[]
            ): boolean {

    // First, assuming that these Face3D are coplanar,
    // we project them onto the 2D plane basis and obtain
    // 2D coordinates for all of the vertices. This
    // simplifies the problem to detecting whether two
    // normal old convex polygons intersect.

    // Suppose Face A has N sides, and Face B has M sides.
    // For each of these N + M different sides, compute the
    // (2D) normal vectors. Each of these vectors is a potential
    // line to project onto and check for "shadow overlap".
    // By the Separating Axis Theorem, we have that if even one
    // of the shadows do not overlap, these polygons don't intersect.
    // On the other hand, if the shadows overlap in every case,
    // the polygons must intersect.

    const N = BigInt(setA.length);
    const M = BigInt(setB.length);

    // Check the normals for face A.
    for (let i = 0n; i < N; i++) {
    const firstVertex = setA[Number(i)];
    const secondVertex = setA[Number((i + 1n) % N)];
    const edgeDirection = pt.subtract(secondVertex, firstVertex);
    const normal = pt.createPoint2D(
        edgeDirection.y,
        edgeDirection.x * -1
    ); // Opposite reciprocal.

    // Check for shadow overlap.
    if (!computeShadowOverlap(setA, setB, normal)) {
        // Some shadow doesn't overlap; the faces are separable.
        return false;
    }
    }

    // Check the normals for face B.
    for (let i = 0n; i < M; i++) {
    const firstVertex = setB[Number(i)];
    const secondVertex = setB[Number((i + 1n) % M)];
    const edgeDirection = pt.subtract(secondVertex, firstVertex);
    const normal = pt.createPoint2D(
        edgeDirection.y,
        edgeDirection.x * -1
    ); // Opposite reciprocal.

    // Check for shadow overlap.
    if (!computeShadowOverlap(setA, setB, normal)) {
        // Some shadow doesn't overlap; the faces are separable.
        return false;
    }
    }

    // Every shadow computed overlaps; the faces must intersect.
    return true;
}