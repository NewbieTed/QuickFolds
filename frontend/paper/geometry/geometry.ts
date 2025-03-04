/**
 * @fileoverview Implementation of useful geometric operations, 
 * such as solving linear systems or change of basis.
 */


import {Face3D} from "./Face3D.js"
import * as pt from "./Point.js"


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
 * Gets an orthonormal basis for the coordinate system whose origin
 * is at the pivot of the given Face3D, and whose plane matches the
 * underlying plane of the Face3D.
 * @param face The Face3D to get a basis for.
 * @returns The plane basis whose:
 *            - origin is the given face's pivot,
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
            pt.dotProduct(basis.axis1, point),
            pt.dotProduct(basis.axis2, point)
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



export function computeFaceIntersection(
            faceA: Face3D, 
            faceB: Face3D
        ): boolean {

    //

    return false;
}