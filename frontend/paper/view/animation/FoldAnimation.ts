/**
 * @fileoverview The animation that folds the paper. Essentially a rotation.
 */

import * as pt from "../../geometry/Point.js";
import {Face3D} from "../../geometry/Face3D.js";
import {Animation} from "./Animation.js";


export class FoldAnimation implements Animation {

    private axisPoint1: pt.Point3D;
    private axisPoint2: pt.Point3D;
    private deltaAngle: number;
    private faces: Face3D[];
    private time: number;
    private totalTime: number;
    private steepness: number;

    constructor(
                axisPoint1: pt.Point3D,
                axisPoint2: pt.Point3D,
                deltaAngle: number,
                ...faces: Face3D[]
                ) {

        this.axisPoint1 = axisPoint1;
        this.axisPoint2 = axisPoint2;
        this.deltaAngle = deltaAngle * Math.PI / 180; // convert to radians
        this.faces = faces;
        this.time = 0;
        this.totalTime = 10; // (In roughly seconds)
        this.steepness = 15; // A measure of how fast the speed
        // of the paper is near the middle of the animation.

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
        const denom = 1 + Math.exp(-this.steepness * time/this.totalTime + this.steepness/2);
        return this.deltaAngle / denom;
    }

}