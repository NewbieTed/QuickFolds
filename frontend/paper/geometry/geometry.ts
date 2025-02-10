/**
 * @fileoverview Contains basic point-related types and geometric operations.
 */


// ----------------------------- Types ------------------------------------- //


/**
 * Describes the two classes of points that could appear in the program:
 * annotations, and vertices. Vertices define faces, while annotations
 * merely live inside/on faces.
 */
type PointContext = "Vertex" | "Annotation";

/**
 * A two-dimensional point.
 */
type Point2D = {
    readonly x: number,
    readonly y: number,
    readonly context: PointContext,
    readonly dim: "2D"
}

/**
 * A three-dimensional point.
 */
type Point3D = {
    readonly x: number,
    readonly y: number,
    readonly z: number,
    readonly context: PointContext,
    readonly dim: "3D"
}

/**
 * Union type of points.
 */
type Point = Point2D | Point3D;


// ----------------------------- Functions --------------------------------- //


/**
 * Creates a new 2D point given the coordinates and context.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @param context The context - defaults to Annotation.
 * @returns 
 */
function createPoint2D(
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
function createPoint3D(
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
function copyPoint<T extends Point>(
            source: T, 
            context: PointContext = source.context): T {

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
function addPoints<T extends Point>(
            a: T, b: T, 
            context: PointContext = "Annotation"): T {

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
function subtractPoints<T extends Point>(
            a: T, b: T, 
            context: PointContext = "Annotation"): T {

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
function scalarProduct(a: Point3D, b: Point3D): number {

    let result = 0;
    result += a.x * b.x;
    result += a.y * b.y;
    result += a.z * b.z;

    return result;
}


/**
 * Computes the distance between two points.
 * @param a First point, must have same dimension as b.
 * @param b Second point, must have same dimension as a.
 * @returns The Euclidean distance between points a and b.
 */
function distance<T extends Point>(a: T, b: T): number {

    let squaredDist = 0;
    squaredDist += (a.x - b.x)**2;
    squaredDist += (a.y - b.y)**2;
    
    if (a.dim == "3D" && b.dim == "3D") {
        squaredDist += (a.z - b.z)**2;
    }

    return Math.sqrt(squaredDist);
}


function rotatePoint(point: Point3D, axis: null, angle: null) {

}