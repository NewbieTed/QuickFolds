/**
 * @fileoverview Implementation of the Face3D class, whose instances form
 * the graph data structure representing the paper.
 */


import {getNextFaceID} from "../view/SceneManager.js"
import * as THREE from 'three';
import * as pt from "./Point.js";


/**
 * An AnnotationUpdate3D object describes the new points
 * created, the new lines created, the old lines deleted, and the old
 * points deleted when an annotation method is called.
 */
export type AnnotationUpdate3D = {
    readonly pointsAdded: Map<bigint, pt.AnnotatedPoint3D>
    readonly pointsDeleted: bigint[]
    readonly linesAdded: Map<bigint, pt.AnnotatedLine>
    readonly linesDeleted: bigint[]
}

export class Face3D {

    /**
     * ID - matches the ID of the corresponding Face3D. Unique identifier
     * vertices - the vertices defining this face, in some adjacency order
     * N - the number of vertices
     * annotatedPoints - annotated points id'd at integers > the # of vertices
     * annotatedLines - annotated lines between points
     * pointObjects - the Three.js objects for annotation points
     * lineObjects - the Three.js objects for annotation lines
     * paperThickness - how thick the paper is
     * offset - the number of half-paper-thicknesses away from the underlying
     *          plane, positive is in the direction of the principal normal
     * faceObject -  the three JS object which appears in this scene.
     * faceObjectCenter - the center of the three JS object for the face
     * pivot - the parent three JS object to all objects of this Face3D
     * nextLineID - the integer to be used as the id of the next created line
     * nextPointID - the integer to be used as the id of the next created point
     * principalNormal - a unit vector which shows the principal normal of the
     *                  paper, which is pointing out from the same side of the
     *                  paper that was originally face-up in the crease pattern
     * startPosition - caches the position of this object if a rotation starts
     * startRotation - caches the rotation of this object if a rotation starts
     * startNormal - caches the principal normal vector if a rotation starts
     * startOffset - caches the offset if a rotation starts.
     */
    public readonly ID: bigint;
    public readonly vertices: pt.Point3D[];
    public readonly N: bigint;
    private annotatedPoints: Map<bigint, pt.AnnotatedPoint3D>;
    private annotatedLines: Map<bigint, pt.AnnotatedLine>;
    private pointObjects: Map<bigint, THREE.Points>;
    private lineObjects: Map<bigint, THREE.Mesh>;
    private faceObject: THREE.Mesh;
    private pivot: THREE.Object3D;
    private faceObjectCenter: THREE.Object3D;
    private paperThickness: number;
    private offset: number;
    private principalNormal: pt.Point3D;
    private startPosition: THREE.Vector3;
    private startRotation: THREE.Quaternion;
    private startNormal: pt.Point3D;
    private startOffset: number;

    public constructor(
                vertices: pt.Point3D[],
                paperThickness: number,
                offset: number,
                principalNormal: pt.Point3D,
                faceID: bigint | null = null
                ) {
        if (faceID !== null) {
            this.ID = faceID;
        } else {
            this.ID = getNextFaceID();
        }

        this.vertices = vertices;
        this.N = BigInt(vertices.length);
        this.annotatedPoints = new Map<bigint, pt.AnnotatedPoint3D>();
        this.annotatedLines = new Map<bigint, pt.AnnotatedLine>();
        this.pointObjects = new Map<bigint, THREE.Points>();
        this.lineObjects = new Map<bigint, THREE.Mesh>();
        this.paperThickness = paperThickness;
        this.offset = offset;
        this.principalNormal = pt.normalize(principalNormal);

        // Create the initial face object and pivot.
        this.faceObject = this.createFaceObject();
        this.faceObject.layers.enableAll();
        this.faceObject.layers.set(0);
        this.pivot = new THREE.Object3D();

        this.faceObjectCenter = new THREE.Object3D();
        const center: pt.Point3D = pt.average(this.vertices);
        // Crucially: the pivot lies in the true plane, not with the
        // face object mesh which could be offset from the true plane.
        this.pivot.position.copy(new THREE.Vector3(
            center.x, center.y, center.z
        ));
        const offsetVector = new THREE.Vector3(
            this.principalNormal.x * this.offset * this.paperThickness * 0.5,
            this.principalNormal.y * this.offset * this.paperThickness * 0.5,
            this.principalNormal.z * this.offset * this.paperThickness * 0.5
        );
        this.faceObjectCenter.position.copy(offsetVector.add(this.pivot.position));
        this.pivot.attach(this.faceObjectCenter);
        this.faceObjectCenter.attach(this.faceObject);

        // Set initial rotation/position and offset.
        this.startPosition = new THREE.Vector3();
        this.startPosition.copy(this.pivot.position);
        this.startRotation = new THREE.Quaternion();
        this.startRotation.copy(this.pivot.quaternion);
        this.startNormal = pt.copyPoint(this.principalNormal);

        console.log("POSITION OF CREATED FACE MESH: ", this.faceObject.position);
    }

    public getThickness(): number {
        return this.paperThickness;
    }

    public getOffset(): number {
        return this.offset;
    }

    public getPrincipleNormal(): pt.Point3D {
        return this.principalNormal;
    }

    /**
     * Generates the 3D polygon geometry from the initialization of vertices.
     * @returns A Three JS object mesh which displays this Face3D.
     */
    private createFaceObject(): THREE.Mesh {

        // In origami, all faces are actually convex polygons, provided that
        // the paper was initially a convex polygon. Therefore their centroid
        // is contained inside of the polygon. Since Three.js defines all
        // geometry using triangles, drawing lines from the vertices to the
        // centroid is a natural way to create the polygon geometry we need.

        // Vector for translating the slab off of the underlying plane.
        const principalOffset: pt.Point3D = pt.scalarMult(
            this.principalNormal, this.paperThickness * this.offset * 0.5
        );
        // The centroid of the slab.
        const centroid: pt.Point3D = pt.add(
            pt.average(this.vertices), principalOffset
        );
        // Vector for offsetting half the thickness of the paper
        const centerOffset: pt.Point3D = pt.scalarMult(
            this.principalNormal, this.paperThickness * 0.5
        );
        const centroidTop: pt.Point3D = pt.add(centroid, centerOffset);
        const centroidBot: pt.Point3D = pt.subtract(centroid, centerOffset);

        // Create mesh points from all the vertices.
        const points: number[] = [];
        points.push(centroidTop.x, centroidTop.y, centroidTop.z); // 0
        points.push(centroidBot.x, centroidBot.y, centroidBot.z); // 1
        for (let i = 0n; i < this.N; i++) {

            // Find the projection of the vertex onto the slab's center plane.
            const center: pt.Point3D = pt.add(
                this.vertices[Number(i)], principalOffset
            );

            // Compute the top and bottom points.
            const bot: pt.Point3D = pt.subtract(center, centerOffset);
            const top: pt.Point3D = pt.add(center, centerOffset);

            points.push(top.x, top.y, top.z); // Index 2*i + 2
            points.push(bot.x, bot.y, bot.z); // Index 2*i + 3
        }

        // Now create the faces of the slab by referring to point indices.
        const triangles: number[] = [];
        for (let i = 0n; i < this.N; i++) {

            const topIndex = Number(2n*i + 2n);
            const botIndex = Number(2n*i + 3n);
            const nextTopIndex = Number(2n*((i + 1n) % this.N) + 2n);
            const nextBotIndex = Number(2n*((i + 1n) % this.N) + 3n);

            // Triangle on top.
            triangles.push(topIndex, nextTopIndex, 0);
            // Triangle on bottom.
            triangles.push(1, nextBotIndex, botIndex);
            // First side triangle.
            triangles.push(topIndex, nextBotIndex, nextTopIndex);
            // Second side triangle.
            triangles.push(topIndex, botIndex, nextBotIndex);
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
        const faceMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xc036e0,
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0,
            clearcoat: 0.1,
            reflectivity: 0.1,
            opacity: 1,
            flatShading: true
        });

        return new THREE.Mesh(faceGeometry, faceMaterial);
    }

    /**
     * Generates the 3D geometry to display an annotated point.
     * @param point A Point3D assumed to be already on the true face plane.
     * @returns A Three JS object mesh which displays the provided point.
     */
    private createPointObject(point: pt.Point3D): THREE.Points {

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
    private createLineObject(
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

    /**
     * Gets the main parent object of all the geometry/meshes of this Face3D.
     * @returns The 'pivot' or central parent Three.js object for this Face3D.
     */
    public getPivot(): THREE.Object3D {
        return this.pivot;
    }

    /**
     * Gets the main mesh corresponding to the face geometry of this Face3D.
     * @returns The face geometry mesh for this Face3D.
     */
    public getFaceObject(): THREE.Object3D {
        return this.faceObject;
    }

    /**
     * Update the annotations in this Face3D according to an annotations
     * update object, which tells this Face3D which points and lines to
     * create and delete. Automatically updates internal geometry.
     * @param update The annotations update object.
     * @returns A FaceUpdate3D object which contains Three.js objects that
     * need to be deleted and added to the scene.
     * @throws Error when referring to IDs of non-existent points/lines.
     */
    public updateAnnotations(update: AnnotationUpdate3D): void {

        // Delete the lines that need to be deleted.
        for (const lineID of update.linesDeleted) {
            if (!this.annotatedLines.delete(lineID)) {
                throw new Error(`No line with id ${lineID} exists.`);
            }
            const lineObject = this.lineObjects.get(lineID);
            if (lineObject !== undefined) {
                // Dispose of the object.
                this.faceObject.remove(lineObject);
                lineObject.geometry.dispose();
                if (Array.isArray(lineObject.material)) {
                    lineObject.material.forEach(mat => mat.dispose());
                } else {
                    lineObject.material.dispose();
                }
            }
            this.lineObjects.delete(lineID);
        }

        // Delete the points that need to be deleted.
        for (const pointID of update.pointsDeleted) {
            if (!this.annotatedPoints.delete(pointID)) {
                throw new Error(`No point with id ${pointID} exists.`);
            }
            const pointObject = this.pointObjects.get(pointID);
            if (pointObject !== undefined) {
                // Dispose of the object.
                this.faceObject.remove(pointObject);
                pointObject.geometry.dispose();
                if (Array.isArray(pointObject.material)) {
                    pointObject.material.forEach(mat => mat.dispose());
                } else {
                    pointObject.material.dispose();
                }
            }
            this.pointObjects.delete(pointID);
        }

        // Add the points that need to be added.
        for (const pointID of update.pointsAdded.keys()) {
            const point = update.pointsAdded.get(pointID);
            if (point !== undefined) {
                this.annotatedPoints.set(pointID, point);
                const pointObject = this.createPointObject(point.point);
                pointObject.layers.enableAll();
                pointObject.layers.set(1);
                this.pointObjects.set(pointID, pointObject);
                this.faceObject.attach(pointObject);
            }
        }

        // Add the lines that need to be added.
        for (const lineID of update.linesAdded.keys()) {
            const line = update.linesAdded.get(lineID);
            if (line !== undefined) {
                const startPoint = this.getPoint(line.startPointID);
                const endPoint = this.getPoint(line.endPointID);
                this.annotatedLines.set(lineID, line);
                const lineObject = this.createLineObject(startPoint, endPoint);
                lineObject.layers.enableAll();
                lineObject.layers.set(1);
                this.lineObjects.set(lineID, lineObject);
                this.faceObject.attach(lineObject);
            }
        }

    }

    /**
     * Gets the point in this face with the given id number.
     * This could be a vertex or an annotated point.
     * @param pointID The ID of the point to get.
     * @returns The Point3D corresponding to the given point ID.
     * @throws Error if the given ID does not correspond to any point.
     */
    public getPoint(pointID: bigint): pt.Point3D {
        if (pointID < 0) {
            throw new Error(`This face has no Point3D with id ${pointID}.`);
        } else if (pointID < BigInt(this.vertices.length)) {
            return this.vertices[Number(pointID)];
        } else {
            const result = this.annotatedPoints.get(pointID);
            if (result !== undefined) {
                return result.point as pt.Point3D;
            }
            throw new Error(`This face has no Point3D with id ${pointID}.`);
        }
    }

    /**
     * Gets the annotated point in this face with the given ID.
     * @param pointID The ID of the annotated point to get.
     * @returns The AnnotatedPoint3D object corresponding to the given ID.
     * @throws Error if there is no annotated point with the given ID.
     */
    public getAnnotatedPoint(pointID: bigint): pt.AnnotatedPoint3D {
        const result = this.annotatedPoints.get(pointID);
        if (result !== undefined) {
            return result;
        }
        throw new Error(`This face has no annotated point with id ${pointID}.`);
    }

    /**
     * Gets the annotated line in this face with the given ID.
     * @param lineID The ID of the annotated point to get.
     * @returns The AnnotatedLine object corresponding to the given ID.
     * @throws Error if there is no annotated line with the given ID.
     */
    public getAnnotatedLine(lineID: bigint): pt.AnnotatedLine {
        const result = this.annotatedLines.get(lineID);
        if (result !== undefined) {
            return result;
        }
        throw new Error(`This face has no annotated line with id ${lineID}.`);
    }

    /**
     * Projects the given Point3D onto the plane that the face's underlying
     * polygon is contained within.
     * @param point The point to project onto the face plane.
     * @returns The projection of the given point onto the face plane.
     */
    public projectToFace(point: pt.Point3D): pt.Point3D {
        const displacement: number = pt.dotProduct(
            this.principalNormal, pt.subtract(point, this.vertices[0])
        );
        const result: pt.Point3D = pt.subtract(
            point, pt.scalarMult(this.principalNormal, displacement)
        );
        return result;
    }

    /**
     * Projects the given Point3D onto the edge of the given ID.
     * @param point The point to project onto the edge.
     * @param edgeID The ID of the edge to project onto.
     * @returns The projection of the given point onto the edge.
     * @throws Error if the given ID is not a valid edge ID.
     */
    public projectToEdge(point: pt.Point3D, edgeID: bigint): pt.Point3D {
        if (edgeID < 0 || edgeID >= BigInt(this.vertices.length)) {
            throw new Error(`The ID ${edgeID} is not a valid edge.`);
        }

        const edgeStart: pt.Point3D = this.getPoint(edgeID);
        const edgeEnd: pt.Point3D = this.getPoint((edgeID + 1n) % this.N);
        const direction: pt.Point3D = pt.normalize(pt.subtract(
            edgeEnd, edgeStart
        ));
        const displacement: number = pt.dotProduct(
            direction, pt.subtract(point, edgeStart)
        );
        const result: pt.Point3D = pt.add(
            edgeStart, pt.scalarMult(direction, displacement)
        );
        return result;
    }


    /**
     * Finds the ID of the point nearest to the given point in this face.
     * The nearest point in the face could be an annotation or a vertex.
     * @param point The reference point to find the nearest point to.
     * @returns The ID of the point in this face nearest to the reference.
     */
    public findNearestPoint(point: pt.Point3D): bigint {

        let minID: bigint = 0n;
        let minDist: number = pt.distance(point, this.vertices[0]);

        // Check distances to vertices.
        for (let i = 1n; i < this.N; i++) {
            const dist = pt.distance(point, this.vertices[Number(i)]);
            if (dist < minDist) {
                minID = i;
                minDist = dist;
            }
        }

        // Check distances to annotated points.
        for (const ID of this.annotatedPoints.keys()) {
            const dist = pt.distance(point, this.getAnnotatedPoint(ID).point);
            if (dist < minDist) {
                minID = ID;
                minDist = dist;
            }
        }

        return minID;
    }


    /**
     * Finds the ID of the edge nearest to the given point in this face.
     * @param point The reference point to find the nearest edge to.
     * @returns The ID of the edge in this face nearest to the reference.
     */
    public findNearestEdge(point: pt.Point3D): bigint {

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
        for (const pointObject of this.pointObjects.values()) {
            // Dispose of the object.
            this.pivot.remove(pointObject);
            pointObject.geometry.dispose();
            if (Array.isArray(pointObject.material)) {
                pointObject.material.forEach(mat => mat.dispose());
            } else {
                pointObject.material.dispose();
            }
        }

        // Clean up line materials and geometry.
        for (const lineObject of this.lineObjects.values()) {
            // Dispose of the object.
            this.pivot.remove(lineObject);
            lineObject.geometry.dispose();
            if (Array.isArray(lineObject.material)) {
                lineObject.material.forEach(mat => mat.dispose());
            } else {
                lineObject.material.dispose();
            }
        }

        // Clean up face mesh material and geometry.
        this.pivot.remove(this.faceObject);
        this.faceObject.geometry.dispose();
        if (Array.isArray(this.faceObject.material)) {
            this.faceObject.material.forEach(mat => mat.dispose());
        } else {
            this.faceObject.material.dispose();
        }

    }

    /**
     * Returns the line id based on the provided points
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


    /**
     * Saves the position and rotation of this Face3D so that the next call
     * to rotateFromPreviousPosition() will rotate from the saved position.
     */
    public savePosition() {
        this.startNormal = pt.copyPoint(this.principalNormal);
        this.startPosition = new THREE.Vector3();
        this.startPosition.copy(this.pivot.position);
        this.startRotation = new THREE.Quaternion();
        this.startRotation.copy(this.pivot.quaternion);
    }


    // Saves the offset of this Face3D so that it can be re-loaded with a call
    // to resetOffset().
    public saveOffset() {
        this.startOffset = this.offset;
    }

    // Reloads the offset of this Face3D from the one last saved by saveOffset().
    public resetOffset() {
        this.offset = this.startOffset;
    }



    // Changes the offset position of this Face3D.
    public changeOffset(deltaOffset: number) {

        this.offset += deltaOffset;
        const offsetVector = new THREE.Vector3(
            this.principalNormal.x * this.offset * this.paperThickness * 0.5,
            this.principalNormal.y * this.offset * this.paperThickness * 0.5,
            this.principalNormal.z * this.offset * this.paperThickness * 0.5
        );

        this.faceObjectCenter.position.copy(offsetVector);
    }

    /**
     * Rotates the underlying objects in this Face3D without changing the
     * vertices of the Face3D yet. Useful for animation. Rotates this Face3D's
     * object about the specified axis CCW (right-hand rule) by deltaAngle.
     * @param axisPoint1 The start of the rotation axis
     * @param axisPoint2 The end of the rotation axis.
     * @param deltaAngle The change in angle (radians)
     */
    public rotateObjects(
                axisPoint1: pt.Point3D,
                axisPoint2: pt.Point3D,
                deltaAngle: number
                ): void {

        // Compute the normalized direction vector of the axis.
        const axis: pt.Point3D = pt.normalize(
            pt.subtract(axisPoint2, axisPoint1)
        );

        // Create the translation and quaternion to be applied.
        const shift: THREE.Vector3 = new THREE.Vector3(
            axisPoint1.x, axisPoint1.y, axisPoint1.z
        );
        const q: THREE.Quaternion = new THREE.Quaternion();
        q.setFromAxisAngle(
            new THREE.Vector3(axis.x, axis.y, axis.z), deltaAngle
        );

        // Apply the rotation to the parent object.
        this.pivot.position.sub(shift);
        this.pivot.position.applyQuaternion(q);
        this.pivot.position.add(shift);
        this.pivot.quaternion.premultiply(q);

        // Adjust the principle normal vector.
        const principVec: THREE.Vector3 = new THREE.Vector3(
            this.principalNormal.x,
            this.principalNormal.y,
            this.principalNormal.z
        );
        principVec.applyQuaternion(q);
        this.principalNormal = pt.createPoint3D(
            principVec.x,
            principVec.y,
            principVec.z
        );

    }

    /**
     * Rotates the whole face 3D including both vertices and mesh objects
     * starting from the last position saved by savePosition().
     * Rotates this Face3D about the specified axis CCW
     * (right-hand rule) by deltaAngle.
     * @param axisPoint1 The start of the rotation axis
     * @param axisPoint2 The end of the rotation axis.
     * @param deltaAngle The change in angle (radians)
     */
    public rotateFace(
                axisPoint1: pt.Point3D,
                axisPoint2: pt.Point3D,
                deltaAngle: number
                ): void {

        // Revert to the previous position.
        this.pivot.position.copy(this.startPosition);
        this.pivot.quaternion.copy(this.startRotation);
        this.principalNormal = this.startNormal;

        // Compute the normalized direction vector of the axis.
        const axis: pt.Point3D = pt.normalize(
            pt.subtract(axisPoint2, axisPoint1)
        );

        // Create the translation and quaternion to be applied.
        const shift: THREE.Vector3 = new THREE.Vector3(
            axisPoint1.x, axisPoint1.y, axisPoint1.z
        );
        const q: THREE.Quaternion = new THREE.Quaternion();
        q.setFromAxisAngle(
            new THREE.Vector3(axis.x, axis.y, axis.z), deltaAngle
        );

        // Apply the rotation to the parent three js object.
        this.pivot.position.sub(shift);
        this.pivot.position.applyQuaternion(q);
        this.pivot.position.add(shift);
        this.pivot.quaternion.premultiply(q);

        // Adjust the principle normal vector.
        const principVec: THREE.Vector3 = new THREE.Vector3(
            this.principalNormal.x,
            this.principalNormal.y,
            this.principalNormal.z
        );
        principVec.applyQuaternion(q);
        this.principalNormal = pt.createPoint3D(
            principVec.x, principVec.y, principVec.z
        );

        // Rotate the vertices similarly.
        for (let i = 0n; i < this.N; i++) {

            const oldVertex = this.vertices[Number(i)];
            const vertexVec = new THREE.Vector3(
                oldVertex.x,
                oldVertex.y,
                oldVertex.z,
            )

            vertexVec.sub(shift);
            vertexVec.applyQuaternion(q);
            vertexVec.add(shift);

            this.vertices[Number(i)] = pt.createPoint3D(
                vertexVec.x, vertexVec.y, vertexVec.z, "Vertex"
            );

        }

        // Rotate the annotations similarly.
        for (const pointID of this.annotatedPoints.keys()) {

            const oldAnnotation = this.annotatedPoints.get(pointID);
            const annotationVec = new THREE.Vector3(
                oldAnnotation.point.x,
                oldAnnotation.point.y,
                oldAnnotation.point.z,
            )

            annotationVec.sub(shift);
            annotationVec.applyQuaternion(q);
            annotationVec.add(shift);

            const newAnnotation: pt.AnnotatedPoint3D = {
                point: pt.createPoint3D(
                    annotationVec.x, annotationVec.y, annotationVec.z
                ),
                edgeID: oldAnnotation.edgeID
            }
            this.annotatedPoints.set(pointID, newAnnotation);

        }

    }


    public getAveragePoint() : pt.Point3D {
        let xValue = 0.0;
        let yValue = 0.0;
        let zValue = 0.0;


        for(let i = 0; i < this.N; i++) {
            xValue += this.vertices[i].x;
            yValue += this.vertices[i].y;
            zValue += this.vertices[i].z;
        }


        return pt.createPoint3D(xValue/Number(this.N), yValue/Number(this.N), zValue/Number(this.N));

    }
}
