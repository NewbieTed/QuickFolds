/**
 * Testing for basic functionality for 3d points
 *
 */


import * as assert from 'assert';
 import {
  Point3D,
  createPoint3D,
  copyPoint,
  add,
  subtract,
  scalarMult,
  scalarDiv
} from '../../paper/geometry/Point';




describe('Basic Creation Tests', () => {
  it('Test Constructor', () => {
    let pt: Point3D = createPoint3D(1, 2, 3);
    assert.strictEqual(pt.x, 1);
    assert.strictEqual(pt.y, 2);
    assert.strictEqual(pt.z, 3);
    assert.equal(pt.context, "Annotation");
  });

  it('Test Constructor Negative', () => {
    let pt: Point3D = createPoint3D(-2, -1.5, -1);
    assert.strictEqual(pt.x, -2);
    assert.strictEqual(pt.y, -1.5);
    assert.strictEqual(pt.z, -1);
  });

  it('Test copyPoint', () => {
    let pt: Point3D = createPoint3D(1, 2, 3);
    let copyPt: Point3D = copyPoint(pt);
    assert.notStrictEqual(copyPt, pt);
  });
});



describe('Basic Operations Tests', () => {
  it('Test add', () => {
    let pt1: Point3D = createPoint3D(1, 2, 3);
    let pt2: Point3D = createPoint3D(3, 4, 5);

    let resultPt: Point3D = add(pt1, pt2);
    assert.strictEqual(resultPt.x, 4);
    assert.strictEqual(resultPt.y, 6);
    assert.strictEqual(resultPt.z, 8);

    resultPt = add(resultPt, resultPt);
    assert.strictEqual(resultPt.x, 8);
    assert.strictEqual(resultPt.y, 12);
    assert.strictEqual(resultPt.z, 16);
  });

  it('Test Subtract', () => {
    let pt1: Point3D = createPoint3D(1, 2, 3);
    let pt2: Point3D = createPoint3D(3, 10, 12);

    let resultPt: Point3D = subtract(pt1, pt2);
    assert.strictEqual(resultPt.x, -2);
    assert.strictEqual(resultPt.y, -8);
    assert.strictEqual(resultPt.z, -9);

    resultPt = subtract(resultPt, resultPt);
    assert.strictEqual(resultPt.x, 0);
    assert.strictEqual(resultPt.y, 0);
    assert.strictEqual(resultPt.z, 0);
  });



  it('Test Scalar Mult', () => {
    let pt1: Point3D = createPoint3D(1, 2, 3);
    let result: Point3D = scalarMult(pt1, 2);
    assert.equal(result.x, 2);
    assert.equal(result.y, 4);
    assert.equal(result.z, 6);

    result = scalarMult(result, 0.5);
    assert.equal(result.x, pt1.x);
    assert.equal(result.y, pt1.y);
    assert.equal(result.z, pt1.z);

  });



  it('Test Scalar Div', () => {
    let pt1: Point3D = createPoint3D(1, 2, 3);
    let result: Point3D = scalarDiv(pt1, 2);
    assert.equal(result.x, 0.5);
    assert.equal(result.y, 1);
    assert.equal(result.z, 1.5);

    result = scalarDiv(result, 0.5);
    assert.equal(result.x, pt1.x);
    assert.equal(result.y, pt1.y);
    assert.equal(result.z, pt1.z);

  });
});

