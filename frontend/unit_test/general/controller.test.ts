/**
 * Test file to deal with the math heavy operations used in the controller class
 */


import * as assert from 'assert';
// import { METHODS TO TEST HERE } from 'LOCALFILE';
import {solveBasisSystem, processTransationFrom3dTo2d} from "../../paper/controller/Controller";
import { createPoint2D, createPoint3D } from '../../paper/geometry/Point';
import { Face3D } from '../../paper/geometry/Face3D';
import { Face2D } from '../../paper/geometry/Face2D';
import { create } from 'domain';

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
      assert.ok(closeToTest(val.beta, 0, MAX_DIFF));
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
      assert.ok(closeToTest(val.beta, 0, MAX_DIFF));
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
      assert.ok(closeToTest(val.beta, 0, MAX_DIFF));
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
      assert.ok(closeToTest(val.beta, 0, MAX_DIFF));
    }
  });

   it('translate3dTo2d xy/xz plane', () => {
    // create a simple plane on xy plane, ie there should be no change (just ingnore z)
    let result = processTransationFrom3dTo2d(
      createPoint3D(0, 0.5, 0),
      new Face3D([
          createPoint3D(0, 0, 0),
          createPoint3D(0, 1, 0),
          createPoint3D(1, 1, 0),
          createPoint3D(1, 0, 0),
        ],
          0.5, 0,
          createPoint3D(0, 0, 1)
        ),
        new Face2D([
          createPoint2D(0, 0),
          createPoint2D(0, 1),
          createPoint2D(1, 1),
          createPoint2D(1, 0)
        ])
      );

      if (result == null) {
        assert.notEqual(result, null);
      } else {
        assert.ok(closeToTest(result.x, 0, MAX_DIFF));
        assert.ok(closeToTest(result.y, 0.5, MAX_DIFF));
      }


      // try xz now
      result = processTransationFrom3dTo2d(
      createPoint3D(0, 0, 0.5),
      new Face3D([
          createPoint3D(0, 0, 0),
          createPoint3D(0, 0, 1),
          createPoint3D(1, 0, 1),
          createPoint3D(1, 0, 0),
        ],
          0.5, 0,
          createPoint3D(0, 1, 0)
        ),
        new Face2D([
          createPoint2D(0, 0),
          createPoint2D(0, 1),
          createPoint2D(1, 1),
          createPoint2D(1, 0)
        ])
      );

      if (result == null) {
        assert.notEqual(result, null);
      } else {
        assert.ok(closeToTest(result.x, 0, MAX_DIFF));
        assert.ok(closeToTest(result.y, 0.5, MAX_DIFF));
      }
   });


});

