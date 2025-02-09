/**
 * @fileoverview Contains basic point-related types and geometric operations.
 */


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