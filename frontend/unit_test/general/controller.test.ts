/**
 * Test file to deal with the math heavy operations used in the controller class
 */


import * as assert from 'assert';
// import { METHODS TO TEST HERE } from 'LOCALFILE';
import {solveBasisSystem, processTransationFrom3dTo2d} from "../../paper/controller/Controller";
import { createPoint3D } from '../../paper/geometry/Point';
import { Face3D } from '../../paper/geometry/Face3D';

const MAX_DIFF = 0.01;



function closeToTest(val1: number, val2: number, maxDiff: number) : boolean {
  return Math.abs(val1 - val2) <= MAX_DIFF;
}


describe('Math heavy tests', () => {
  it('solveBasisSystem xy plane', () => {
    let val = solveBasisSystem(
      1, 0, 0,
      0, 2, 0,
      1, 2, 0
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 1, MAX_DIFF));
      assert.ok(closeToTest(val.beta, 1, MAX_DIFF));
    }



    val = solveBasisSystem(
      1, 0, 0,
      0, 2, 0,
      1, 4, 0
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 1, MAX_DIFF));
      assert.ok(closeToTest(val.beta, 2, MAX_DIFF));
    }



    val = solveBasisSystem(
      1, 0, 0,
      0, -1, 0,
      1, 1, 0
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 1, MAX_DIFF));
      assert.ok(closeToTest(val.beta, -1, MAX_DIFF));
    }



    val = solveBasisSystem(
      2, 0, 0,
      0, -1, 0,
      1, -1, 0
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 0.5, MAX_DIFF));
      assert.ok(closeToTest(val.beta, -1, MAX_DIFF));
    }
  });



  it('solveBasisSystem xz plane', () => {
    let val = solveBasisSystem(
      1, 0, 0,
      0, 0, 2,
      1, 0, 2
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 1, MAX_DIFF));
      assert.ok(closeToTest(val.beta, 1, MAX_DIFF));
    }



    val = solveBasisSystem(
      1, 0, 0,
      0, 0, 2,
      1, 0, 4
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 1, MAX_DIFF));
      assert.ok(closeToTest(val.beta, 2, MAX_DIFF));
    }



    val = solveBasisSystem(
      1, 0, 0,
      0, 0, -1,
      1, 0, 1
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 1, MAX_DIFF));
      assert.ok(closeToTest(val.beta, -1, MAX_DIFF));
    }



    val = solveBasisSystem(
      2, 0, 0,
      0, 0, -1,
      1, 0, -1
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 0.5, MAX_DIFF));
      assert.ok(closeToTest(val.beta, 1, MAX_DIFF));
    }
  });


  it('solveBasisSystem non straight plane', () => {
    let val = solveBasisSystem(
      1, 1, 0,
      1, -1, 3,
      2, 0, 3
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 1, MAX_DIFF));
      assert.ok(closeToTest(val.beta, 1, MAX_DIFF));
    }



    val = solveBasisSystem(
      1, -1, 0,
      1, -1, 3,
      3, -3, 3
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 2, MAX_DIFF));
      assert.ok(closeToTest(val.beta, 1, MAX_DIFF));
    }



    val = solveBasisSystem(
      1, -1, 1,
      1, -1, 3,
      1, -1, -3
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val.alpha, 3, MAX_DIFF));
      assert.ok(closeToTest(val.beta, -2, MAX_DIFF));
    }
  });


   it('translate3dTo2d xz plane', () => {
    let result = processTransationFrom3dTo2d(
      new createPoint3D(0, 1, 0),
      new Face3D([
        new createPoint3D(0, 0, 0),
        new createPoint3D(0, 1, 0),
        new createPoint3D(1, 1, 0),
        new createPoint3D(1, 0, 0),
      ],
    0.5, 0,
  new createPoint3D(0, 0, 1), null));
   });

});