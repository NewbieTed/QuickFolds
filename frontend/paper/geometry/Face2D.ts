/**
 * @fileoverview Implementation of the Face2D class, whose instances form
 * the graph data structure representing the paper.
 */

import * as pt from "./Point";


class Face2D {

    /**
     * ID - matches the ID of the corresponding Face3D. Unique identifier
     * vertices - the vertices defining this face, in some adjacency order
     * annotatedPoints - annotated points id'd at #s after Point
     */
    // private readonly ID: bigint;
    // private readonly vertices: Point2D[];
    // private annotatedPoints: Map<bigint, AnnotatedPoint>;
    // private annotatedLines: Map<bigint, AnnotatedLine>;
    // private pointToLine: Map<bigint, Set<bigint>>;


    public constructor() {

    }


    public addAnnotatedPoint(point: pt.Point2D): void {

    }

    public addAnnotatedLine(startPointID: bigint, endPointID: bigint): void {
        // handles intersections too
    }

    public delAnnotatedPoint(pointID: bigint): void {

    }

    public delAnnotatedLine(lineID: bigint): void {

    }



    public containedInFace(point: pt.Point2D): boolean {
        return false;
    }

    public findNearestPoint(point: pt.Point2D): bigint {
        return 0n;
    }



}
