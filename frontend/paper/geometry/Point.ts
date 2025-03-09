/**
 * @fileoverview Contains basic point-related types and geometric operations.
 */

import { Face2D } from "./Face2D.js";
import { Face3D } from "./Face3D.js";


// ----------------------------- Types ------------------------------------- //


/**
 * Describes the two classes of points that could appear in the program:
 * annotations, and vertices. Vertices define faces, while annotations
 * merely live inside/on faces.
 */
export type PointContext = "Vertex" | "Annotation";

/**
 * A two-dimensional point.
 */
export type Point2D = {
    readonly x: number,
    readonly y: number,
    readonly context: PointContext,
    readonly dim: "2D"
}

/**
 * A three-dimensional point.
 */
export type Point3D = {
    readonly x: number,
    readonly y: number,
    readonly z: number,
    readonly context: PointContext,
    readonly dim: "3D"
}

/**
 * Union type of points.
 */
export type Point = Point2D | Point3D;


/**
 * An annotated 3D point type - consists of the point object and
 * also the ID of the edge on which it lies, if any.
 * The value -1 is given if the annotated point lies on no edge.
 */
export type AnnotatedPoint3D = {
    point: Point3D,
    edgeID: bigint
}

/**
 * An annotated 2D point type - consists of the point object and
 * also the ID of the edge on which it lies, if any.
 * The value -1 is given if the annotated point lies on no edge.
 */
export type AnnotatedPoint2D = {
    point: Point2D,
    edgeID: bigint
}

/**
 * An annotated line type. Its fields are the IDs of two points on
 * the face - the points could be vertices, or annotated points.
 */
export type AnnotatedLine = {
    startPointID: bigint,
    endPointID: bigint
}


// ----------------------------- Functions --------------------------------- //


/**
 * Creates a new 2D point given the coordinates and context.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @param context The context - defaults to Annotation.
 * @returns
 */
export function createPoint2D(
            x: number, y: number,
            context: PointContext = "Annotation"
            ): Point2D {

    const point: Point2D = {
        x: x,
        y: y,
        context: context,
        dim: "2D"
    }

    return point;
}


/**
 * Creates a new 2D point given the coordinates and context.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @param z The z coordinate.
 * @param context The context - defaults to Annotation.
 * @returns
 */
export function createPoint3D(
            x: number, y: number, z: number,
            context: PointContext = "Annotation",
            edgeId: bigint = -1n
            ): Point3D {

    const point: Point3D = {
        x: x,
        y: y,
        z: z,
        context: context,
        dim: "3D"
    }

    return point;
}


/**
 * Creates and returns a copy of the given 2D or 3D point. The optional
 * parameter context allows you to change the context of the copy, to be
 * annotation or vertex. If cnntext is not specified, the copied point will
 * have the same context as the source.
 * @param source The point to copy, either a Point2D or Point3.
 * @param context The context of the new point.
 *                Defaults to the same context as the source point.
 * @returns A copy of the given point with its kind potentially changed.
 */
export function copyPoint<T extends Point>(
            source: T,
            context: PointContext = source.context
            ): T {

    if (source.dim === "2D") {

        const copy: Point2D = {
            x: source.x,
            y: source.y,
            context: context,
            dim: "2D"
        }

        return copy as T;

    } else {

        const copy: Point3D = {
            x: source.x,
            y: source.y,
            z: source.z,
            context: context,
            dim: "3D"
        }

        return copy as T;
    }

}


/**
 * Adds two points of the same dimension together.
 * @param a First point, must have same dimension as b.
 * @param b Second point, must have same dimension as a.
 * @param context Context of the resulting point.
 *                Defaults to Annotation.
 * @returns The coordinate-wise sum of a + b (vector addition),
 *          a new point with the given context.
 */
export function add<T extends Point>(
            a: T, b: T,
            context: PointContext = "Annotation"
            ): T {

    if (a.dim === "2D" && b.dim == "2D") {

        const result: Point2D = {
            x: a.x + b.x,
            y: a.y + b.y,
            context: context,
            dim: "2D"
        }

        return result as T;

    } else if (a.dim == "3D" && b.dim == "3D") {

        const result: Point3D = {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z,
            context: context,
            dim: "3D"
        }

        return result as T;
    }

    // This line of code never runs; the compiler in fact
    // catches when we pass in a and b with different dimension.
    return a;
}


/**
 * Subtracts two points of the same dimension.
 * @param a First point, must have same dimension as b.
 * @param b Second point, must have same dimension as a.
 * @param context Context of the resulting point.
 *                Defaults to Annotation.
 * @returns The coordinate-wise sum of a - b (vector subtraction),
 *          a new point with the given context.
 */
export function subtract<T extends Point>(
            a: T, b: T,
            context: PointContext = "Annotation"
            ): T {

    if (a.dim === "2D" && b.dim == "2D") {

        const result: Point2D = {
            x: a.x - b.x,
            y: a.y - b.y,
            context: context,
            dim: "2D"
        }

        return result as T;

    } else if (a.dim == "3D" && b.dim == "3D") {

        const result: Point3D = {
            x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z,
            context: context,
            dim: "3D"
        }

        return result as T;
    }

    // This line of code never runs; the compiler in fact
    // catches when we pass in a and b with different dimension.
    return a;
}


/**
 * Computes the scalar product (dot product) of two points.
 * @param a The first point.
 * @param b The second point.
 * @returns The scalar product a * b (component-wise multiply and add).
 */
export function dotProduct<T extends Point>(a: T, b: T): number {

    let result: number = 0;
    result += a.x * b.x;
    result += a.y * b.y;

    if (a.dim == "3D" && b.dim == "3D") {
        result += a.z * b.z;
    }

    return result;
}

/**
 * Computes the vector (cross) product of two 3D vectors.
 * @param a The first vector to multiply.
 * @param b The second vector to multiply
 * @param context Context of the resulting point.
 *                Defaults to Annotation.
 * @returns the vector product a x b.
 */
export function crossProduct(
            a: Point3D,
            b: Point3D,
            context: PointContext = "Annotation"
            ): Point3D {

    const result: Point3D = {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
        context: context,
        dim: "3D"
    }

    return result;
}


/**
 * Computes scalar multiplication of a point by some real number.
 * @param vector The vector to multiply.
 * @param scalar The factor to multiply that vector by.
 * @param context Context of the resulting point.
 *                Defaults to Annotation.
 * @returns vec * scalar, the vector scaled component-wise by the scalar.
 */
export function scalarMult<T extends Point>(
            vector: Point,
            scalar: number,
            context: PointContext = "Annotation"
            ): T {

    if (vector.dim === "2D") {

        const result: Point2D = {
            x: vector.x * scalar,
            y: vector.y * scalar,
            context: context,
            dim: "2D"
        }

        return result as T;

    } else {

        const result: Point3D = {
            x: vector.x * scalar,
            y: vector.y * scalar,
            z: vector.z * scalar,
            context: context,
            dim: "3D"
        }

        return result as T;
    }

}


/**
 * Computes scalar division of a point by some real number.
 * @param vector The vector to divide.
 * @param scalar The factor to divide that vector by.
 * @param context Context of the resulting point.
 *                Defaults to Annotation.
 * @returns vec / scalar, the vector scaled component-wise by the scalar.
 * @throws Error if the given scalar to divide by is 0.
 */
export function scalarDiv<T extends Point>(
            vector: Point,
            scalar: number,
            context: PointContext = "Annotation"
            ): T {

    // Edge case.
    if (scalar === 0) {
        throw new Error("Cannot divide Point by 0!");
    }

    if (vector.dim === "2D") {

        const result: Point2D = {
            x: vector.x / scalar,
            y: vector.y / scalar,
            context: context,
            dim: "2D"
        }

        return result as T;

    } else {

        const result: Point3D = {
            x: vector.x / scalar,
            y: vector.y / scalar,
            z: vector.z / scalar,
            context: context,
            dim: "3D"
        }

        return result as T;
    }

}


/**
 * Computes the average of an array of vectors.
 * @param vectors The vectors to average.
 * @param context Context of the resulting point.
 *                Defaults to Annotation.
 * @returns The sum of the vectors divided by how many there are.
 *          The average of no vectors (empty array) is 0.
 */
export function average<T extends Point>(
            vectors: T[],
            context: PointContext = "Annotation"
            ) {

    if (vectors[0].dim === "3D") {

        let sum: Point3D = createPoint3D(0, 0, 0, context);
        for (let i = 0; i < vectors.length; i++) {
            sum = add(sum, vectors[i] as Point3D);
        }
        // Edge case.
        if (vectors.length == 0) {
            return sum as T;
        }
        const avg: Point3D = scalarDiv(sum, vectors.length, context);
        return avg as T;

    } else if (vectors[0].dim === "2D") {

        let sum: Point2D = createPoint2D(0, 0, context);
        for (let i = 0; i < vectors.length; i++) {
            sum = add(sum, vectors[i] as Point2D);
        }
        // Edge case.
        if (vectors.length == 0) {
            return sum as T;
        }
        const avg: Point2D = scalarDiv(sum, vectors.length, context);
        return avg as T;
    }

}


/**
 * Computes the distance between two points.
 * @param a First point, must have same dimension as b.
 * @param b Second point, must have same dimension as a.
 * @returns The Euclidean distance between points a and b.
 */
export function distance<T extends Point>(a: T, b: T): number {

    let squaredDist = 0;
    squaredDist += (a.x - b.x)**2;
    squaredDist += (a.y - b.y)**2;

    if (a.dim == "3D" && b.dim == "3D") {
        squaredDist += (a.z - b.z)**2;
    }

    return Math.sqrt(squaredDist);
}


/**
 * Computes the length of a vector
 * @param vec A Point (being used as a vector).
 * @returns The length of the vector.
 */
export function length(vec: Point): number {

    if (vec.dim === "2D") {
        return Math.sqrt(vec.x**2 + vec.y**2);
    } else {
        return Math.sqrt(vec.x**2 + vec.y**2 + vec.z**2);
    }
}


/**
 * Normalizes a nonzero vector.
 * @param vec A Point (being used as a vector).
 * @returns The unit vector pointing the same direction as the given vector.
 * @throws Error if the given vector is too close to the zero vector.
 */
export function normalize<T extends Point>(vec: T): T {
    if (length(vec) < 0.01) {
        throw new Error("Cannot normalize extremely small Point!");
    }
    return scalarDiv(vec, length(vec));
}




  /**
 * calculates the new point to put in face 2d based on the provided point
 * and corresponding face 3d object
 * @param point - the point to translate into 2d
 * @param face3d - the face 3d object the point is
 * @param face2d - the face 2d object the point is translated to
 * Note the id of both faces must match
 * @returns - the translated 2d point, or null if there is an error
 */
export function processTransationFrom3dTo2d(point: Point3D, face3d : Face3D, face2d: Face2D) {
    let points : Point3D[] = [];
    for (let i = 0; i < 3; i++) {
      points.push(face3d.vertices[i]);
    }

    const basis1 : Point3D = createPoint3D(
      points[1].x - points[0].x,
      points[1].y - points[0].y,
      points[1].z - points[0].z,
    );

    const basis2 : Point3D = createPoint3D(
      points[2].x - points[0].x,
      points[2].y - points[0].y,
      points[2].z - points[0].z,
    );

    let basisResult = solveForScalars(
    [basis1.x, basis1.y, basis2.z],
    [basis2.x, basis2.y, basis2.z],
    [point.x, point.y, point.z]
    );


    if (basisResult == null) {
      return null;
    }


    // because our problem is isometric, use the same coordinates for our
    // new basis vectors rotated on the 2d plane
    const point0in2D : Point2D = face2d.vertices[0];
    const point1in2D : Point2D = face2d.vertices[1];
    const point2in2D : Point2D = face2d.vertices[2];

    const basis1in2d : Point2D = createPoint2D(
      point1in2D.x - point0in2D.x,
      point1in2D.y - point0in2D.y
    );

    const basis2in2d : Point2D = createPoint2D(
      point2in2D.x - point0in2D.x,
      point2in2D.y - point0in2D.y
    );

    const coverted2dPoint = createPoint2D(
      basis1in2d.x * basisResult[0] +  basis2in2d.x * basisResult[1],
      basis1in2d.y * basisResult[0] +  basis2in2d.y * basisResult[1],
    );

    return coverted2dPoint;
  }


  /**
 * Solve a * v1 + b * v2 = t for scalars a, b in R^3.
 *
 * If a solution exists, returns [a, b].
 * If no solution exists (i.e. t is not in the plane spanned by v1, v2),
 * or if v1, v2 are collinear (no unique solution), returns null.
 */
export function solveForScalars(
    v1: [number, number, number],
    v2: [number, number, number],
    t: [number, number, number]
  ): [number, number] {
    // Cross product helper
    function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
      return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
      ];
    }

    // Dot product helper
    function dot(a: [number, number, number], b: [number, number, number]): number {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    // Normal vector n = v1 x v2
    const n = cross(v1, v2);

    // |v1 x v2|^2
    const denom = dot(n, n);

    // a = ((t x v2) ⋅ (v1 x v2)) / |v1 x v2|^2
    const tXv2 = cross(t, v2);
    const a = dot(tXv2, n) / denom;

    // b = -((t x v1) ⋅ (v1 x v2)) / |v1 x v2|^2
    const tXv1 = cross(t, v1);
    const b = -dot(tXv1, n) / denom;

    return [a, b];
  }