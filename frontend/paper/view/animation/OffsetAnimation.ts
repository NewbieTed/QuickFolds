/**
 * @fileoverview The animation that folds the paper. Essentially a rotation.
 */

import * as SceneManager from "../SceneManager.js";
import {Animation} from "./Animation.js";


export class OffsetAnimation implements Animation {

    private offsets: Map<bigint, number>;
    private time: number;
    private totalTime: number;

    constructor(offsets: Map<bigint, number>) {

        this.offsets = offsets;
        this.time = 0;
        this.totalTime = 2; // (In roughly seconds)

    }

    public update() {

        for (const faceID of this.offsets.keys()) {
            // Get the change in offset for one step, and
            // offset the faces incrementally.
            SceneManager.getFace3DByID(faceID).changeOffset(
                this.offsets.get(faceID) / 120
            );
        }

        // The framerate of Three.js is about 60 fps.
        this.time += 1 / 60;
    }

    public isComplete() {

        if (this.time >= this.totalTime) {
            return true;
        }

        return false;
    }

}