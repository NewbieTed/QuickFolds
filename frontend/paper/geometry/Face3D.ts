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
    private pointGeometry: Map<bigint, THREE.Points>;
    private lineGeometry: Map<bigint, THREE.Mesh>;
    private mesh: THREE.Mesh;
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
        this.pointGeometry = new Map<bigint, THREE.Points>();
        this.lineGeometry = new Map<bigint, THREE.Mesh>();
        this.paperThickness = paperThickness;
        this.offset = offset;
        this.principalNormal = pt.normalize(principalNormal);

        this.mesh = this.createFaceGeometry();
    }


    /**
     * Generates the 3D polygon geometry from the initialization of vertices.
     * @returns A Three JS object mesh which displays this Face3D.
     */
    private createFaceGeometry(): THREE.Mesh {

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

    /**
     * Generates the 3D geometry to display an annotated point.
     * @param point A Point3D assumed to be already on the true face plane.
     * @returns A Three JS object mesh which displays the provided point.
     */
    private createPointGeometry(point: pt.Point3D): THREE.Points {

        // Vector for translating the slab off of the underlying plane.
        const principalOffset: pt.Point3D = pt.scalarMult(
            this.principalNormal, this.paperThickness * this.offset * 0.5
        );
        const pos: pt.Point3D = pt.add(point, principalOffset);

        // Create a glowing point.
        const glowingMaterial = new THREE.PointsMaterial({
            color: 0x0000ff,
            size: 0.1,
            opacity: 1,
            sizeAttenuation: true,
            depthTest: false
        });
        const pointGeometry = new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3(pos.x, pos.y, pos.z)]
        );
        const glowingPoint = new THREE.Points(pointGeometry, glowingMaterial);

        // Render this point last (to get X-ray vision).
        glowingPoint.renderOrder = 2;

        return glowingPoint;
    }


    /**
     * Generates the 3D geometry to display an annotated line.
     * @param start A Point3D assumed to be already in the true face.
     * @param end A Point3D assumed to be already in the true face.
     * @returns A Three JS object mesh which displays the provided line.
     */
    private createLineGeometry(
                start: pt.Point3D,
                end: pt.Point3D
                ): THREE.Mesh {

        // Vector for translating the slab off of the underlying plane.
        const principalOffset: pt.Point3D = pt.scalarMult(
            this.principalNormal, this.paperThickness * this.offset * 0.5
        );
        const pos1: pt.Point3D = pt.add(start, principalOffset);
        const pos2: pt.Point3D = pt.add(end, principalOffset);

        // Create a glowing line.
        const glowingMaterial = new THREE.MeshBasicMaterial({
            color: 0x00aa22,
            opacity: 1,
            side: THREE.DoubleSide,
            depthTest: false
        });
        const lineCurve = new THREE.LineCurve3(
            new THREE.Vector3(pos1.x, pos1.y, pos1.z),
            new THREE.Vector3(pos2.x, pos2.y, pos2.z)
        );
        const lineGeometry = new THREE.TubeGeometry(lineCurve, 1, 0.01, 16);
        const glowingLine = new THREE.Mesh(lineGeometry, glowingMaterial);

        // Render this line last (to get X-ray vision).
        glowingLine.renderOrder = 1;

        return glowingLine;
    }

    // TODO: create constructor from Face2D + 3D annotations.

    /**
     * Collects and returns all of the meshes corresponding to this Face3D.
     * @returns A list of all Three.js meshes corresponding to this Face3D.
     */
    public collectObjects(): THREE.Object3D[] {

        const meshes: THREE.Object3D[] = [this.mesh];
        for (const pointGeo of this.pointGeometry.values()) {
            meshes.push(pointGeo);
        }
        for (const lineGeo of this.lineGeometry.values()) {
            meshes.push(lineGeo);
        }

        return meshes;
    }

    /**
     * Gets the main mesh corresponding to the face geometry of this Face3D.
     * @returns The face geometry mesh for this Face3D.
     */
    public getFaceMesh(): THREE.Object3D {
        return this.mesh;
    }

    public addAnnotatedPoint(point: pt.Point3D): void {

        const objectsToAdd: THREE.Object3D[] = [];
        const objectsToDelete: THREE.Object3D[] = [];

        // Delete the lines that need to be deleted.
        for (const lineID of update.linesDeleted) {
            if (!this.annotatedLines.delete(lineID)) {
                throw new Error(`No line with id ${lineID} exists.`);
            }
            const lineObject = this.lineGeometry.get(lineID);
            if (lineObject !== undefined) {
                objectsToDelete.push(lineObject);
            }
            this.lineGeometry.delete(lineID);
        }

        // Delete the points that need to be deleted.
        for (const pointID of update.pointsDeleted) {
            if (!this.annotatedPoints.delete(pointID)) {
                throw new Error(`No point with id ${pointID} exists.`);
            }
            const pointObject = this.pointGeometry.get(pointID);
            if (pointObject !== undefined) {
                if (!Array.isArray(pointObject.material)) {
                    pointObject.material.dispose();
                }
                objectsToDelete.push(pointObject);
            }

            this.pointGeometry.delete(pointID);
        }

        // Add the points that need to be added.
        for (const pointID of update.pointsAdded.keys()) {
            const point = update.pointsAdded.get(pointID);
            if (point !== undefined) {
                this.annotatedPoints.set(pointID, point);
                const pointObject = this.createPointGeometry(point.point);
                this.pointGeometry.set(pointID, pointObject);
                objectsToAdd.push(pointObject);
            }
        }

        // Add the lines that need to be added.
        for (const lineID of update.linesAdded.keys()) {
            const line = update.linesAdded.get(lineID);
            if (line !== undefined) {
                const startPoint = this.getPoint(line.startPointID);
                const endPoint = this.getPoint(line.endPointID);
                this.annotatedLines.set(lineID, line);
                const lineObject = this.createLineGeometry(startPoint, endPoint);
                this.lineGeometry.set(lineID, lineObject);
                objectsToAdd.push(lineObject);
            }
        }

        // Construct and return the face update object.
        const faceUpdate: FaceUpdate3D = {
            objectsToAdd: objectsToAdd,
            objectsToDelete: objectsToDelete
        }

        return faceUpdate;
    }

    public addAnnotatedLine(startPointID: bigint, endPointID: bigint): void {
        // handles intersections too
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



        let minID: bigint = 0n;
        let minDist = pt.distance(point, this.projectToEdge(point, 0n));

        // Check distances to edges by projection.
        for (let i = 1n; i < this.N; i++) {
            const dist = pt.distance(point, this.projectToEdge(point, i));
            if (dist < minDist) {
                minID = i;
                minDist = dist;
            }
        }

        return minID;
    }


    /**
     * Dispose of all the Three.js objects that this Face3D manages.
     */
    public dispose() {

        // Clean up point materials.
        for (const point of this.pointGeometry.values()) {
            if (!Array.isArray(point.material)) {
                point.material.dispose();
            }
        }

        // Clean up line materials and geometry.
        for (const line of this.lineGeometry.values()) {
            line.geometry.dispose();
            if (!Array.isArray(line.material)) {
                line.material.dispose();
            }
        }

        // Clean up face mesh material and geometry.
        this.mesh.geometry.dispose();
        if (!Array.isArray(this.mesh.material)) {
            this.mesh.material.dispose();
        }

    }

    /**
     * returns the line id based on the provided points
     * @param pointId1 - the first point in the line
     * @param pointId2 - second point in the line
     * @returns the line id, or -1 if there is no line
     */
    public getLineIdFromPointIds(pointId1: bigint, pointId2: bigint) : bigint {
        for (const [lineId, lineObj] of this.annotatedLines) {
            if ((lineObj.startPointID == pointId1 && lineObj.endPointID == pointId2) ||
                (lineObj.startPointID == pointId2 && lineObj.endPointID == pointId1)) {
                    return lineId;
            }
        }

        return -1n;
    }

    // Rotates this Face3D about its X axis by a certain angle.
    public rotateX(deltaAngle: number) {

        // Compute the main object's x-axis in world space:
        const mainXAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(this.mesh.quaternion);

        // Rotate the main face mesh.
        this.mesh.position.sub(this.mesh.position);
        this.mesh.position.applyAxisAngle(mainXAxis, deltaAngle);
        this.mesh.position.add(this.mesh.position);
        const q = new THREE.Quaternion().setFromAxisAngle(mainXAxis, deltaAngle);
        this.mesh.quaternion.premultiply(q);

        // Iterate over all points and lines, do the same thing.
        for (const obj of this.pointGeometry.values()) {
            // Rotate the point about the axis.
            obj.position.sub(this.mesh.position);
            obj.position.applyAxisAngle(mainXAxis, deltaAngle);
            obj.position.add(this.mesh.position);
            obj.quaternion.premultiply(q);
        }
        for (const obj of this.lineGeometry.values()) {
            // Rotate the line about the axis.
            obj.position.sub(this.mesh.position);
            obj.position.applyAxisAngle(mainXAxis, deltaAngle);
            obj.position.add(this.mesh.position);
            obj.quaternion.premultiply(q);
        }
        
    }
    
    // TODO: rotate the three js geometry method, vs rotate the true face.
    // TODO: methods to change visibility and disable/enable raycasting thru this face.

}