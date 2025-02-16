/**
 * @fileoverview Contains basic point-related types and geometric operations.
 */


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
 * An annotated point type - consists of the point object and
 * also the ID of the edge on which it lies, if any.
 * The value -1 is given if the annotated point lies on no edge.
 */
export type AnnotatedPoint = {
    point: Point,
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
            context: PointContext = "Annotation"
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
 * Computes the scalar product (dot product) of two 3D points.
 * @param a The first point.
 * @param b The second point.
 * @returns The scalar product a * b (component-wise multiply and add).
 */
export function dotProduct(a: Point3D, b: Point3D): number {

    let result = 0;
    result += a.x * b.x;
    result += a.y * b.y;
    result += a.z * b.z;

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
 * Computes the average of an array of 3D vectors.
 * @param vectors The 3D vectors to average.
 * @param context Context of the resulting point.
 *                Defaults to Annotation.
 * @returns The sum of the vectors divided by how many there are.
 *          The average of no vectors (empty array) is 0.
 */
export function average(
            vectors: Point3D[], 
            context: PointContext = "Annotation"
            ) {

    let sum: Point3D = createPoint3D(0, 0, 0, context);
    for (let i = 0; i < vectors.length; i++) {
        sum = add(sum, vectors[i]);
    }
    
    // Edge case.
    if (vectors.length == 0) {
        return sum;
    }

    const avg: Point3D = scalarDiv(sum, vectors.length, context);
    return avg;
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


// TODO
export function rotatePoint(point: Point3D, axis: null, angle: null) {

}