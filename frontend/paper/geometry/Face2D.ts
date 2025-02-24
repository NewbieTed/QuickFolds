/**
 * @fileoverview Implementation of the Face2D class, whose instances form
 * the graph data structure representing the paper.
 */


import {EditorStatusType} from "../view/EditorMessage";
import {getNextFaceID} from "../view/SceneManager"
import * as pt from "./Point";

const DISTANCE_TO_FOLD_EDGE_TO_DELETE = 0.5;

/**
 * An AnnotationUpdate2D object describes the new points
 * created, the new lines created, the old lines deleted, and the old
 * points deleted when an annotation method is called. The update
 * object also has a status indicating whether the addition of this
 * line was sucessful by a certain status code.
 */
export type AnnotationUpdate2D = {
    readonly status: EditorStatusType;
    readonly pointsAdded: Map<bigint, pt.AnnotatedPoint2D>
    readonly pointsDeleted: bigint[]
    readonly linesAdded: Map<bigint, pt.AnnotatedLine>
    readonly linesDeleted: bigint[]
}


export class Face2D {

    /**
     * ID - matches the ID of the corresponding Face3D. Unique identifier
     * vertices - the vertices defining this face, in some adjacency order
     * N - the number of vertices
     * annotatedPoints - annotated points id'd at integers > the # of vertices
     * annotatedLines - annotated lines between points
     * nextLineID - the integer to be used as the id of the next created line
     * nextPointID - the integer to be used as the id of the next created point
     */
    public readonly ID: bigint;
    public readonly vertices: pt.Point2D[];
    public readonly N: bigint;
    private annotatedPoints: Map<bigint, pt.AnnotatedPoint2D>;
    private annotatedLines: Map<bigint, pt.AnnotatedLine>;
    private nextLineID: bigint;
    private nextPointID: bigint;

    public constructor(vertices: pt.Point2D[]) {

        this.ID = getNextFaceID();
        this.vertices = vertices;
        this.N = BigInt(vertices.length);
        this.nextPointID = BigInt(vertices.length);
        this.nextLineID = 0n;
        this.annotatedPoints = new Map<bigint, pt.AnnotatedPoint2D>();
        this.annotatedLines = new Map<bigint, pt.AnnotatedLine>();
    }


    /**
     * @returns a defensive copy of the annotated Points map [id to point]
     */
    public getAnnotatedPointMap() : Map<bigint, pt.AnnotatedPoint2D>  {
        return new Map(this.annotatedPoints);
    }


    /**
     * @returns a defensive copy of the annotated Lines map [id to point]
     */
    public getAnnotatedLinesMap() : Map<bigint, pt.AnnotatedLine>  {
        return new Map(this.annotatedLines);
    }

    /**
     * Given a provided point, returns if the given line id is on the point
     * Because of how floating point works, we consider a point close enough to a line if it
     * is less than DISTANCE_TO_FOLD_EDGE_TO_DELETE
     * @param pointToCheck - the point to check if it's merged
     * @param lineId - the id to check from
     * @returns whether the point is close enough
     */
    public isPointOnCustomLine(pointToCheck: pt.Point2D, lineId: bigint) : boolean {
        const projPoint: pt.Point2D = this.projectToLine(pointToCheck, lineId);
        return pt.distance(projPoint, pointToCheck) <= DISTANCE_TO_FOLD_EDGE_TO_DELETE;
    }


    /**
     * Adds an annotated point to this Face2D.
     * @param point The point to add (assumed to be on this face).
     * @param edgeID The ID of the edge that this point lies on.
     *               Defaults to -1, indicating the point lies on no edge.
     * @returns The annotation update object.
     */
    public addAnnotatedPoint(point: pt.Point2D, edgeID: bigint = -1n): AnnotationUpdate2D {

        const newPt: pt.AnnotatedPoint2D = {
            point: point,
            edgeID: edgeID
        }

        const pointsAdded = new Map<bigint, pt.AnnotatedPoint2D>();
        const pointsDeleted: bigint[] = [];
        const linesAdded = new Map<bigint, pt.AnnotatedLine>();
        const linesDeleted: bigint[] = [];

        this.annotatedPoints.set(this.nextPointID, newPt);
        pointsAdded.set(this.nextPointID, newPt);
        this.nextPointID++;

        // Construct and return the annotations update object.
        const update: AnnotationUpdate2D = {
            status: "NORMAL", // Success
            pointsAdded: pointsAdded,
            pointsDeleted: pointsDeleted,
            linesAdded: linesAdded,
            linesDeleted: linesDeleted
        }

        return update;
    }

    /**
     * Creates a new annotated line directly, without any rendering, and doesn't cause any intersection
     * changes. THIS METHOD IS DANGEROUS. It will break the system if not used correctly.
     * This method is intended for temporary math caluclations given only to Annotated Lines.
     * @param startPointId - the id of the start point to add to our new "line"
     * @param endPointID - the id of the end point to add to our new "line"
     * @returns the id of the created line
     */
    public addRawAnnotatedLine(
                startPointId: bigint,
                endPointID: bigint
                ) : bigint {

        const line1: pt.AnnotatedLine = {
            startPointID: startPointId,
            endPointID: endPointID
        };

        this.annotatedLines.set(this.nextLineID, line1);
        this.nextLineID++;

        return this.nextLineID - 1n;
    }

    /**
     * Adds an annotated line to this face. This automatically computes
     * all new intersections between annotated lines and updates the lines
     * accordingly, returning an update object showing the changes.
     * @param startPointID The ID of the start point of the new line.
     * @param endPointID The ID of the end point of the new line.
     * @returns The annotation update object.
     */
    public addAnnotatedLine(
                startPointID: bigint,
                endPointID: bigint
                ): AnnotationUpdate2D {

        const intersections = [];
        const newLine: pt.AnnotatedLine = {
            startPointID: startPointID,
            endPointID: endPointID
        };
        const startPoint: pt.Point2D = this.getPoint(startPointID);
        const endPoint: pt.Point2D = this.getPoint(endPointID);

        // First pass: find all of the intersections.
        for (const lineID of this.annotatedLines.keys()) {
            // If it overlaps, disallow creation.
            const overlaps: boolean = this.checkOverlap(
                newLine, this.getAnnotatedLine(lineID)
            );
            if (overlaps) {
                // Make empty annotation update and return.
                const update: AnnotationUpdate2D = {
                    status: "BAD_LINE_ADD_OVERLAP", // Failure
                    pointsAdded: new Map<bigint, pt.AnnotatedPoint2D>(),
                    pointsDeleted: [],
                    linesAdded: new Map<bigint, pt.AnnotatedLine>(),
                    linesDeleted: []
                }
                return update;
            }

            // If it intersects, record the location and distance.
            const intersection = this.getIntersection(
                newLine, this.getAnnotatedLine(lineID)
            );
            if (intersection !== undefined) {
                intersections.push({
                    point: intersection,
                    lineID: lineID,
                    distance: pt.distance(startPoint, intersection)
                });
            }
        }

        // Now sort the intersections by their distance to the start point.
        intersections.sort((a, b) => a.distance - b.distance);

        // Now we make all of the necessary edits.
        const pointsAdded = new Map<bigint, pt.AnnotatedPoint2D>();
        const pointsDeleted: bigint[] = [];
        const linesAdded = new Map<bigint, pt.AnnotatedLine>();
        const linesDeleted: bigint[] = [];

        let current: pt.Point2D = startPoint;
        let currentID: bigint = startPointID;
        for (const intersection of intersections) {

            const lineToSplit = this.getAnnotatedLine(intersection.lineID);

            // Add the intersection point.
            const newPt: pt.AnnotatedPoint2D = {
                point: intersection.point,
                edgeID: -1n
            }
            this.annotatedPoints.set(this.nextPointID, newPt);
            pointsAdded.set(this.nextPointID, newPt);
            const pointID: bigint = this.nextPointID;
            this.nextPointID++;

            // Add the line from current to intersection point.
            const line1: pt.AnnotatedLine = {
                startPointID: currentID,
                endPointID: pointID
            }
            this.annotatedLines.set(this.nextLineID, line1);
            linesAdded.set(this.nextLineID, line1);
            this.nextLineID++;

            // Add the the two lines that split lineToSplit in half.
            const line2: pt.AnnotatedLine = {
                startPointID: pointID,
                endPointID: lineToSplit.startPointID
            }
            this.annotatedLines.set(this.nextLineID, line2);
            linesAdded.set(this.nextLineID, line2);
            this.nextLineID++;

            const line3: pt.AnnotatedLine = {
                startPointID: pointID,
                endPointID: lineToSplit.endPointID
            }
            this.annotatedLines.set(this.nextLineID, line3);
            linesAdded.set(this.nextLineID, line3);
            this.nextLineID++;

            // Delete the lineToSplit.
            this.annotatedLines.delete(intersection.lineID);
            linesDeleted.push(intersection.lineID);

            // Move to the next segment.
            current = intersection.point;
            currentID = pointID;
        }

        // Fence post: the last intersection to the end of the line.
        const lastLine: pt.AnnotatedLine = {
            startPointID: currentID,
            endPointID: endPointID
        }
        this.annotatedLines.set(this.nextLineID, lastLine);
        linesAdded.set(this.nextLineID, lastLine);
        this.nextLineID++;

        // Construct and return the annotations update object.
        const update: AnnotationUpdate2D = {
            status: "NORMAL", // Success
            pointsAdded: pointsAdded,
            pointsDeleted: pointsDeleted,
            linesAdded: linesAdded,
            linesDeleted: linesDeleted
        }

        return update;
    }


    /**
     * @param pointId - the id of the point you want to see what lines it's apart of
     * @returns A list of line ids that the pointId is inside of
     */
    public getIdsOfLinesPointIsIn(pointId: bigint) {
        const retList: bigint[] = [];
        for (const [lineId, lineObj] of this.annotatedLines) {
            if (lineObj.endPointID == pointId || lineObj.startPointID == pointId) {
                retList.push(lineId);
            }
        }

        return retList;
    }

    /**
     * Checks whether two annotated lines are close to overlapping.
     * @param line1 The first annotated line.
     * @param line2 The second annotated line.
     * @returns True if the lines share one endpoint, have nearly the same
     * slope, and the one of the non-shared endpoints is between the other
     * non-shared endpoint and the shared endpoint.
     */
    private checkOverlap(
                line1: pt.AnnotatedLine,
                line2: pt.AnnotatedLine
                ): boolean {

        let shared: pt.Point2D = pt.createPoint2D(0,0);
        let nonShared1: pt.Point2D = pt.createPoint2D(0,0);
        let nonShared2: pt.Point2D = pt.createPoint2D(0,0);

        if (line1.startPointID === line2.startPointID) {

            shared = this.getPoint(line1.startPointID);
            nonShared1 = this.getPoint(line1.endPointID);
            nonShared2 = this.getPoint(line2.endPointID);

        } else if (line1.startPointID === line2.endPointID) {

            shared = this.getPoint(line1.startPointID);
            nonShared1 = this.getPoint(line1.endPointID);
            nonShared2 = this.getPoint(line2.startPointID);

        } else if (line1.endPointID === line2.startPointID) {

            shared = this.getPoint(line1.endPointID);
            nonShared1 = this.getPoint(line1.startPointID);
            nonShared2 = this.getPoint(line2.endPointID);

        } else if (line1.endPointID === line2.endPointID) {

            shared = this.getPoint(line1.endPointID);
            nonShared1 = this.getPoint(line1.startPointID);
            nonShared2 = this.getPoint(line2.startPointID);

        } else {

            // The two lines share no points.
            return false;
        }

        // Get the direction vectors of the lines.
        const dir1: pt.Point2D = pt.normalize(pt.subtract(nonShared1, shared));
        const dir2: pt.Point2D = pt.normalize(pt.subtract(nonShared2, shared));

        // If the dot product is too close to 1, the directions are too close.
        // This is the cosine of the angle between the vectors.
        const cosAngle: number = pt.dotProduct(dir1, dir2);

        return Math.abs(cosAngle - 1) < 0.0001;
    }


    /**
     * Checks whether two annotated lines intersect.
     * @param line1 The first annotated line.
     * @param line2 The second annotated line.
     * @returns Undefined if the intersection of the two annotated lines
     * does not exist or if they share a common endpoint, otherwise the
     * Point2D corresponding to the intersection of the two lines.
     */
    private getIntersection(
                line1: pt.AnnotatedLine,
                line2: pt.AnnotatedLine
                ): pt.Point2D | undefined {

        if (this.shareEndpoint(line1, line2)) {
            return undefined;
        }

        // Get the direction vectors of the lines.
        const u: pt.Point2D = this.getPoint(line1.startPointID);
        const v: pt.Point2D = this.getPoint(line1.endPointID);
        const s: pt.Point2D = this.getPoint(line2.startPointID);
        const t: pt.Point2D = this.getPoint(line2.endPointID);
        const dir1: pt.Point2D = pt.normalize(pt.subtract(v, u));
        const dir2: pt.Point2D = pt.normalize(pt.subtract(t, s));

        // If the dot product is too close to 1 or -1, they're parallel.
        // This is the absolute cosine of the angle between the vectors.
        const cosAngle: number = Math.abs(pt.dotProduct(dir1, dir2));

        if (Math.abs(cosAngle - 1) < 0.0001) {
            // Surely don't intersect (the intersection point of the abstract
            // lines could be somewhere far away outside the polygons).
            return undefined;
        }

        // Calculate the intersection of the abstract lines,
        // i.e. extend the line segments infinitely.

        const offset: pt.Point2D = pt.subtract(s, u);
        const determinant: number = dir2.x * dir1.y - dir1.x * dir2.y;
        const numerator: number = offset.y * dir2.x - offset.x * dir2.y;
        const intersection: pt.Point2D = pt.add(
            u, pt.scalarMult(dir1, numerator / determinant)
        );

        const onSegmentUV: boolean = pt.distance(u, intersection) <
                                     pt.distance(u, v) &&
                                     pt.distance(v, intersection) <
                                     pt.distance(u, v);
        const onSegmentST: boolean = pt.distance(s, intersection) <
                                     pt.distance(s, t) &&
                                     pt.distance(t, intersection) <
                                     pt.distance(s, t);

        return (onSegmentUV && onSegmentST) ? intersection : undefined;
    }

    /**
     * Checks whether two annotated lines share an endpoint.
     * @param line1 The first annotated line.
     * @param line2 The second annotated line.
     * @returns True if the lines share an endpoint, false otherwise.
     */
    private shareEndpoint(
                line1: pt.AnnotatedLine,
                line2: pt.AnnotatedLine
                ): boolean {

        const result: boolean = (line1.startPointID === line2.startPointID) ||
                                (line1.endPointID === line2.endPointID) ||
                                (line1.startPointID === line2.endPointID) ||
                                (line1.endPointID === line2.startPointID);
        return result;
    }

    /**
     * Deletes the annotated point with the given ID from this face.
     * @param pointID The ID of the point to delete.
     * @returns The annotation update object.
     * @throws Error if there is no point with the given ID.
     */
    public delAnnotatedPoint(pointID: bigint): AnnotationUpdate2D {

        const result = this.annotatedPoints.get(pointID);
        if (result !== undefined) {

            const pointsAdded = new Map<bigint, pt.AnnotatedPoint2D>();
            const pointsDeleted: bigint[] = [];
            const linesAdded = new Map<bigint, pt.AnnotatedLine>();
            const linesDeleted: bigint[] = [];

            // Check if the point is an endpoint of any lines,
            // and if so disallow the delete.

            for (const lineID of this.annotatedLines.keys()) {
                const line = this.annotatedLines.get(lineID);
                if (line != undefined) {
                    // This always runs, just satisfying TS compiler.
                    if (line.startPointID === pointID ||
                        line.endPointID === pointID) {

                        // Construct and return the annotations update object.
                        const update: AnnotationUpdate2D = {
                            status: "BAD_POINT_DELETE", // Failure
                            pointsAdded: pointsAdded,
                            pointsDeleted: pointsDeleted,
                            linesAdded: linesAdded,
                            linesDeleted: linesDeleted
                        }

                        return update;
                    }

                }

            }

            // Safe to delete this annotated point.
            this.annotatedPoints.delete(pointID);
            pointsDeleted.push(pointID);

            // Construct and return the annotations update object.
            const update: AnnotationUpdate2D = {
                status: "NORMAL", // Success
                pointsAdded: pointsAdded,
                pointsDeleted: pointsDeleted,
                linesAdded: linesAdded,
                linesDeleted: linesDeleted
            }

            return update;
        }

        throw new Error(`This face has no annotated point with id ${pointID}.`);
    }

     /**
     * Deletes the annotated line with the given ID from this face.
     * @param lineID The ID of the line to delete.
     * @returns The annotation update object.
     * @throws Error if there is no line with the given ID.
     */
    public delAnnotatedLine(lineID: bigint): AnnotationUpdate2D {
        const result = this.annotatedLines.get(lineID);
        if (result !== undefined) {

            const pointsAdded = new Map<bigint, pt.AnnotatedPoint2D>();
            const pointsDeleted: bigint[] = [];
            const linesAdded = new Map<bigint, pt.AnnotatedLine>();
            const linesDeleted: bigint[] = [];

            this.annotatedLines.delete(lineID);
            linesDeleted.push(lineID);

            // Construct and return the annotations update object.
            const update: AnnotationUpdate2D = {
                status: "NORMAL", // Success
                pointsAdded: pointsAdded,
                pointsDeleted: pointsDeleted,
                linesAdded: linesAdded,
                linesDeleted: linesDeleted
            }

            return update;
        }
        throw new Error(`This face has no annotated line with id ${lineID}.`);
    }

    /**
     * Gets the point in this face with the given id number.
     * This could be a vertex or an annotated point.
     * @param pointID The ID of the point to get.
     * @returns The Point3D corresponding to the given point ID.
     * @throws Error if the given ID does not correspond to any point.
     */
    public getPoint(pointID: bigint): pt.Point2D {
        if (pointID < 0) {
            throw new Error(`This face has no Point2D with id ${pointID}.`);
        } else if (pointID < BigInt(this.vertices.length)) {
            return this.vertices[Number(pointID)];
        } else {
            const result = this.annotatedPoints.get(pointID);
            if (result !== undefined) {
                return result.point as pt.Point2D;
            }
            throw new Error(`This face has no Point2D with id ${pointID}.`);
        }
    }

    /**
     * Gets the annotated point in this face with the given ID.
     * @param pointID The ID of the annotated point to get.
     * @returns The AnnotatedPoint2D object corresponding to the given ID.
     * @throws Error if there is no annotated point with the given ID.
     */
    public getAnnotatedPoint(pointID: bigint): pt.AnnotatedPoint2D {
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
     * Projects the given Point2D onto the edge of the given ID.
     * @param point The point to project onto the edge.
     * @param edgeID The ID of the edge to project onto.
     * @returns The projection of the given point onto the edge.
     * @throws Error if the given ID is not a valid edge ID.
     */
    public projectToEdge(point: pt.Point2D, edgeID: bigint): pt.Point2D {
        if (edgeID < 0 || edgeID >= BigInt(this.vertices.length)) {
            throw new Error(`The ID ${edgeID} is not a valid edge.`);
        }

        const edgeStart: pt.Point2D = this.getPoint(edgeID);
        const edgeEnd: pt.Point2D = this.getPoint((edgeID + 1n) % this.N);
        const direction: pt.Point2D = pt.normalize(pt.subtract(
            edgeEnd, edgeStart
        ));
        const displacement: number = pt.dotProduct(
            direction, pt.subtract(point, edgeStart)
        );
        const result: pt.Point2D = pt.add(
            edgeStart, pt.scalarMult(direction, displacement)
        );
        return result;
    }


    /**
     * Projects the given Point2D onto the line of the given ID.
     * @param point The point to project onto the line.
     * @param lineId The annotationLineID of the edge to project onto.
     * @returns The projection of the given point onto the edge.
     * @throws Error if the given ID is not a valid edge ID.
     */
    public projectToLine(point: pt.Point2D, lineId: bigint): pt.Point2D {
        if (lineId < BigInt(this.vertices.length)) {
            throw new Error(`The LINE ID ${lineId} is not a valid annotation ilne.`);
        }

        const getAnnotationLine = this.getAnnotatedLine(lineId);

        const edgeStart: pt.Point2D = this.getAnnotatedPoint(getAnnotationLine.startPointID).point;
        const edgeEnd: pt.Point2D = this.getAnnotatedPoint(getAnnotationLine.endPointID).point;
        const direction: pt.Point2D = pt.normalize(pt.subtract(
            edgeEnd, edgeStart
        ));
        const displacement: number = pt.dotProduct(
            direction, pt.subtract(point, edgeStart)
        );
        const result: pt.Point2D = pt.add(
            edgeStart, pt.scalarMult(direction, displacement)
        );
        return result;
    }

}