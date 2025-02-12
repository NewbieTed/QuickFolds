/**
 * Testing for basic functionality for 2d points
 *
 */


import * as assert from 'assert';
 import {
  Point2D,
  createPoint2D,
  copyPoint,
  add,
  subtract,
  scalarMult,
  scalarDiv
} from '../../paper/geometry/Point';




describe('Basic Creation Tests', () => {
  it('Test Constructor', () => {
    let pt: Point2D = createPoint2D(1, 2);
    assert.strictEqual(pt.x, 1);
    assert.strictEqual(pt.y, 2);
    assert.equal(pt.context, "Annotation");
  });

  it('Test Constructor Negative', () => {
    let pt: Point2D = createPoint2D(-2, -1.5);
    assert.strictEqual(pt.x, -2);
    assert.strictEqual(pt.y, -1.5);
  });

  it('Test copyPoint', () => {
    let pt: Point2D = createPoint2D(1, 2);
    let copyPt: Point2D = copyPoint(pt);
    assert.notStrictEqual(copyPt, pt);
  });
});



describe('Basic Operations Tests', () => {
  it('Test add', () => {
    let pt1: Point2D = createPoint2D(1, 2);
    let pt2: Point2D = createPoint2D(3, 4);

    let resultPt: Point2D = add(pt1, pt2);
    assert.strictEqual(resultPt.x, 4);
    assert.strictEqual(resultPt.y, 6);

    resultPt = add(resultPt, resultPt);
    assert.strictEqual(resultPt.x, 8);
    assert.strictEqual(resultPt.y, 12);
  });

  it('Test Subtract', () => {
    let pt1: Point2D = createPoint2D(1, 2);
    let pt2: Point2D = createPoint2D(3, 10);

    let resultPt: Point2D = subtract(pt1, pt2);
    assert.strictEqual(resultPt.x, -2);
    assert.strictEqual(resultPt.y, -8);

    resultPt = subtract(resultPt, resultPt);
    assert.strictEqual(resultPt.x, 0);
    assert.strictEqual(resultPt.y, 0);
  });



  it('Test Scalar Mult', () => {
    let pt1: Point2D = createPoint2D(1, 2);
    let result: Point2D = scalarMult(pt1, 2);
    assert.equal(result.x, 2);
    assert.equal(result.y, 4);

    result = scalarMult(result, 0.5);
    assert.equal(result.x, pt1.x);
    assert.equal(result.y, pt1.y);

  });



  it('Test Scalar Div', () => {
    let pt1: Point2D = createPoint2D(1, 2);
    let result: Point2D = scalarDiv(pt1, 2);
    assert.equal(result.x, 0.5);
    assert.equal(result.y, 1);

    result = scalarDiv(result, 0.5);
    assert.equal(result.x, pt1.x);
    assert.equal(result.y, pt1.y);

  });
});

