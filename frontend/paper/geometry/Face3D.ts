/**
 * @fileoverview Implementation of the Face2D class, whose instances form
 * the graph data structure representing the paper.
 */

import * as THREE from 'three';
import {getNextFaceID} from "../view/SceneManager" 



class Face3D {

    /**
     * ID - matches the ID of the corresponding Face3D. Unique identifier
     * vertices - the vertices defining this face, in some adjacency order
     * annotatedPoints - annotated points id'd at integers > the # of vertices
     * annotatedLines - annotated lines
     * paperThickness - how thick the paper is
     * offset - the number of paper thicknesses away from the underlying plane
     * mesh: the three JS object which appears in this scene.
     * nextLineID: 
     */
    private readonly ID: bigint;
    private readonly vertices: Point3D[];
    private annotatedPoints: Map<bigint, AnnotatedPoint>;
    private annotatedLines: Map<bigint, AnnotatedLine>;
    private mesh: THREE.Object3D;
    private paperThickness: number;
    private offset: number;
    private nextLineID: bigint;
    private nextPointID: bigint;

    public constructor(
                vertices: Point3D[],
                paperThickness: number,
                offset: number,
                ) {

        this.ID = getNextFaceID();
        this.vertices = vertices;
        this.nextPointID = BigInt(vertices.length);
        this.nextLineID = 0n;
        this.annotatedPoints = new Map<bigint, AnnotatedPoint>();
        this.annotatedLines = new Map<bigint, AnnotatedLine>();
        this.paperThickness = paperThickness;
        this.offset = offset;

        // create mesh object.
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
