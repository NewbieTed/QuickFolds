/**
 * @fileoverview Implementation of the Face3D class, whose instances form
 * the graph data structure representing the paper.
 */

import * as THREE from 'three';
import {getNextFaceID} from "../view/SceneManager"
import * as pt from "./Point";



export class Face3D {

    /**
     * ID - matches the ID of the corresponding Face3D. Unique identifier
     * vertices - the vertices defining this face, in some adjacency order
     * annotatedPoints - annotated points id'd at integers > the # of vertices
     * annotatedLines - annotated lines between points
     * paperThickness - how thick the paper is
     * offset - the number of half-paper-thicknesses away from the underlying
     *          plane, positive is in the direction of the principal normal
     * mesh -  the three JS object which appears in this scene
     * nextLineID - the integer to be used as the id of the next created line
     * nextPointID - the integer to be used as the id of the next created point
     * principalNormal - a unit vector which shows the principal normal of the
     *                  paper, which is pointing out from the same side of the
     *                  paper that was originally face-up in the crease pattern
     */
    private readonly ID: bigint;
    private readonly vertices: pt.Point3D[];
    private annotatedPoints: Map<bigint, pt.AnnotatedPoint>;
    private annotatedLines: Map<bigint, pt.AnnotatedLine>;
    private mesh: THREE.Object3D;
    private paperThickness: number;
    private offset: number;
    private nextLineID: bigint;
    private nextPointID: bigint;
    private principalNormal: pt.Point3D;

    public constructor(
                vertices: pt.Point3D[],
                paperThickness: number,
                offset: number,
                principalNormal: pt.Point3D
                ) {

        this.ID = getNextFaceID();
        this.vertices = vertices;
        this.nextPointID = BigInt(vertices.length);
        this.nextLineID = 0n;
        this.annotatedPoints = new Map<bigint, pt.AnnotatedPoint>();
        this.annotatedLines = new Map<bigint, pt.AnnotatedLine>();
        this.paperThickness = paperThickness;
        this.offset = offset;
        this.principalNormal = principalNormal;

        // In origami, all faces are actually convex polygons, provided that
        // the paper was initially a convex polygon. Therefore their centroid
        // is contained inside of the polygon. Since Three.js defines all
        // geometry using triangles, drawing lines from the vertices to the
        // centroid is a natural way to create the polygon geometry we need.

        // Vector for translating the slab off of the underlying plane.
        const principalOffset: pt.Point3D = pt.scalarMult(
            principalNormal, paperThickness * offset * 0.5
        );
        // The centroid of the slab.
        const centroid: pt.Point3D = pt.add(
            pt.average(this.vertices), principalOffset
        );
        // Vector for offsetting half the thickness of the paper
        const centerOffset: pt.Point3D = pt.scalarMult(
            principalNormal, paperThickness * 0.5
        );
        const centroidTop: pt.Point3D = pt.add(centroid, centerOffset);
        const centroidBot: pt.Point3D = pt.subtract(centroid, centerOffset);

        // Number of vertices in this Face3D.
        const N: bigint = BigInt(this.vertices.length);

        // Create mesh points from all the vertices.
        const points: number[] = [];
        points.push(centroidTop.x, centroidTop.y, centroidTop.z); // 0
        points.push(centroidBot.x, centroidBot.y, centroidBot.z); // 1
        for (let i = 0n; i < N; i++) {

            // Find the projection of the vertex onto the slab's center plane.
            const center: pt.Point3D = pt.add(
                vertices[Number(i)], principalOffset
            );

            // Compute the top and bottom points.
            const bot: pt.Point3D = pt.subtract(center, centerOffset);
            const top: pt.Point3D = pt.add(center, centerOffset);

            points.push(top.x, top.y, top.z); // Index 2*i + 2
            points.push(bot.x, bot.y, bot.z); // Index 2*i + 3
        }

        // Now create the faces of the slab by referring to point indices.
        const triangles: number[] = [];
        for (let i = 0n; i < vertices.length; i++) {

            const topIndex = Number(2n*i + 2n);
            const botIndex = Number(2n*i + 3n);
            const nextTopIndex = Number(2n*((i + 1n) % N) + 2n);
            const nextBotIndex = Number(2n*((i + 1n) % N) + 3n);

            // Triangle on top.
            triangles.push(topIndex, nextTopIndex, 0);
            // Triangle on bottom.
            triangles.push(botIndex, nextBotIndex, 1);
            // First side triangle.
            triangles.push(topIndex, nextTopIndex, nextBotIndex);
            // Second side triangle.
            triangles.push(botIndex, nextBotIndex, topIndex);
        }

        // Create the geometry with the points and triangles.
        const faceGeometry = new THREE.BufferGeometry();
        faceGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(points), 3)
        );
        faceGeometry.setIndex(
            new THREE.BufferAttribute(new Uint32Array(triangles), 1)
        );
        faceGeometry.computeVertexNormals();

        // Create the mesh.
        const faceMaterial = new THREE.MeshBasicMaterial({
            color: 0xdea7eb,
            side: THREE.DoubleSide,
            // roughness: 0.5
        });
        this.mesh = new THREE.Mesh(faceGeometry, faceMaterial);
    }

    public getMesh(): THREE.Object3D {
        return this.mesh;
    }

    public addAnnotatedPoint(point: pt.Point3D): void {

    }

    public addAnnotatedLine(startPointID: bigint, endPointID: bigint): bigint {
        // handles intersections too
        return 0n;
    }

    public delAnnotatedPoint(pointID: bigint): void {

    }

    public delAnnotatedLine(lineID: bigint): void {

    }



    public containedInFace(point: pt.Point3D): boolean {
        return false;
    }

    public findNearestPoint(point: pt.Point3D): bigint {
        return 0n;
    }

    public rotateFace(axis: null, angle: null) {

    }



}
