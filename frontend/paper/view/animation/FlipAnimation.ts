/**
 * @fileoverview An animation which flips the given faces 180 degrees 
 * over about 5 seconds.
 */


import {Face3D} from "../../geometry/Face3D";
import {Animation} from "./Animation";


export class FlipAnimation implements Animation {

    private faces: Face3D[];
    private time: number;

    constructor(...faces: Face3D[]) {

        this.faces = faces;
        this.time = 0;

    }

    public update() {

        for (const face of this.faces) {
            face.rotateX(Math.PI * 2 / 200);
        }

        this.time += Math.PI * 2 / 200;
    }

    public isComplete() {
        return this.time >= Math.PI * 2;
    }

}