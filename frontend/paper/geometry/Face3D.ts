/**
 * @fileoverview Implementation of the Face2D class, whose instances form
 * the graph data structure representing the paper.
 */

import * as THREE from 'three';



class Face3D {

    /**
     * ID - matches the ID of the corresponding Face3D. Unique identifier
     * vertices - the vertices defining this face, in some adjacency order
     * annotatedPoints - annotated points id'd at integers > the # of vertices
     * annotatedLines - annotated lines
     * paperThickness - how thick the paper is
     * offset - the number of paper thicknesses away from 
     */
    private readonly ID: bigint;
    private readonly vertices: Point3D[];
    private annotatedPoints: Map<bigint, AnnotatedPoint>;
    private annotatedLines: Map<bigint, AnnotatedLine>;
    // private pointToLine: Map<bigint, Set<bigint>>;
    private THREE.Object3D
    private paperThickness: number;
    private offset: number;

    public constructor() {

    }


    public addAnnotatedPoint(point: Point3D): void {

    }

    public addAnnotatedLine(startPointID: bigint, endPointID: bigint): void {
        // handles intersections too
    }

    public delAnnotatedPoint(pointID: bigint): void {

    }

    public delAnnotatedLine(lineID: bigint): void {

    }



    public containedInFace(point: Point3D): boolean {
        return false;
    }

    public findNearestPoint(point: Point3D): bigint {
        return 0n;
    }

    public rotateFace(axis: null, angle: null) {

    }



}
