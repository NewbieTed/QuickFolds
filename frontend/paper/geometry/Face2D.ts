/**
 * @fileoverview Implementation of the Face2D class, whose instances form
 * the graph data structure representing the paper.
 */


/**
 * An annotated point type - consists of the point object and
 * also the ID of the edge on which it lies, if any.
 * The value -1 is given if the annotated point lies on no edge.
 */
type AnnotatedPoint = {
    point: Point,
    edgeID: bigint
}

/**
 * An annotated line type. Its fields are the IDs of two points on
 * the face - the points could be vertices, or annotated points.
 */
type AnnotatedLine = {
    startPointID: bigint,
    endPointID: bigint
}


class Face2D {

    /**
     * ID - matches the ID of the corresponding Face3D. Unique identifier
     * vertices - the vertices defining this face, in some adjacency order
     * annotatedPoints - annotated points id'd at #s after Point
     */
    private readonly ID: bigint;
    private readonly vertices: Point2D[];
    private annotatedPoints: Map<bigint, AnnotatedPoint>;
    private annotatedLines: Map<bigint, AnnotatedLine>;
    // private pointToLine: Map<bigint, Set<bigint>>;


    public constructor() {

    }


    public addAnnotatedPoint(point: Point2D): void {

    }

    public addAnnotatedLine(startPointID: bigint, endPointID: bigint): void {
        // handles intersections too
    }

    public delAnnotatedPoint(pointID: bigint): void {

    }

    public delAnnotatedLine(lineID: bigint): void {

    }



    public containedInFace(point: Point2D): boolean {
        return false;
    }

    public findNearestPoint(point: Point2D): bigint {
        return 0n;
    }



}
