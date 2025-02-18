/**
 * Test file to deal with the math heavy operations used in the controller class
 */


import * as assert from 'assert';
import {solveForScalars} from "../../paper/geometry/Point";

const MAX_DIFF = 0.01;

function closeToTest(val1: number, val2: number, maxDiff: number) : boolean {
  return Math.abs(val1 - val2) <= MAX_DIFF;
}


describe('Math heavy tests', () => {
  it('solveForScalars xy plane', () => {
    let val = solveForScalars(
      [1, 0, 0],
      [0, 2, 0],
      [1, 2, 0]
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val[0], 1, MAX_DIFF));
      assert.ok(closeToTest(val[1], 1, MAX_DIFF));
    }



    val = solveForScalars(
      [1, 0, 0],
      [0, 2, 0],
      [1, 4, 0]
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val[0], 1, MAX_DIFF));
      assert.ok(closeToTest(val[1], 2, MAX_DIFF));
    }



    val = solveForScalars(
      [1, 0, 0],
      [0, -1, 0],
      [1, 1, 0]
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val[0], 1, MAX_DIFF));
      assert.ok(closeToTest(val[1], -1, MAX_DIFF));
    }



    val = solveForScalars(
      [2, 0, 0],
      [0, -1, 0],
      [1, -1, 0]
    );

    // TS compiler has issues without if/else
    if (val == null) {
      assert.notEqual(val, null);
    } else {
      assert.ok(closeToTest(val[0], 0.5, MAX_DIFF));
      assert.ok(closeToTest(val[1], 1, MAX_DIFF));
    }
  });

});

