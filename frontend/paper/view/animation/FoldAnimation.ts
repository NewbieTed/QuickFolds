/**
 * @fileoverview The animation that folds the paper. Essentially a rotation.
 */

import * as pt from "../../geometry/Point";
import {Face3D} from "../../geometry/Face3D";
import {Animation} from "./Animation";


export class FoldAnimation implements Animation {

    private axisPoint1: pt.Point3D;
    private axisPoint2: pt.Point3D;
    private deltaAngle: number;
    private faces: Face3D[];
    private time: number;
    private totalTime: number;

    constructor(
                axisPoint1: pt.Point3D, 
                axisPoint2: pt.Point3D,
                deltaAngle: number,
                ...faces: Face3D[]
                ) {

        this.axisPoint1 = axisPoint1;
        this.axisPoint2 = axisPoint2;
        this.deltaAngle = deltaAngle;
        this.faces = faces;
        this.time = 0;
        this.totalTime = 2; // (In roughly seconds)

        // Save initial positions.
        for (const face of this.faces) {
            face.savePosition();
        }

    }

    public update() {

        for (const face of this.faces) {
            // Get the change in angle for one step, and
            // rotate the face objects incrementally.
            const currentAngle = this.getAngle(this.time);
            const nextAngle = this.getAngle(this.time + 1 / 60);
            face.rotateObjects(
                this.axisPoint1, 
                this.axisPoint2,
                nextAngle - currentAngle
            );
        }

        // The framerate of Three.js is about 60 fps.
        this.time += 1 / 60;
    }

    public isComplete() {

        if (this.time >= this.totalTime - 1 / 60) {
            for (const face of this.faces) {
                // Rotate the face into its final position accurately.
                face.rotateFace(
                    this.axisPoint1,
                    this.axisPoint2,
                    this.deltaAngle
                );
            }
            return true;
        }

        return false;
    }

    private getAngle(time: number) {
        // A nice formula that gives slow speed of rotation at the
        // start, high speed in the middle, and slow at the end.
        const denom = Math.exp(-10 * time / this.totalTime + 5);
        return this.deltaAngle / denom;
    }

}