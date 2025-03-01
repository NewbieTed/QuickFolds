/**
 * Test file to deal with the math heavy operations used in the controller class
 */

import "../setup.js";
import * as assert from 'assert';
import {createSplitFace} from "../../paper/model/PaperManager.js";
import { Face2D } from '../../paper/geometry/Face2D.js';
import { Face3D } from '../../paper/geometry/Face3D.js';

const MAX_DIFF = 0.01;


describe('Split Tests', () => {
  it('getPointEdgeOrder', () => {
    const squareFace2d = new Face2D([{
        x: 0,
        y: 0,
        context: "Vertex",
        dim: "2D"
      },
      {
        x: 0,
        y: 1,
        context: "Vertex",
        dim: "2D"
      },
      {
        x: 1,
        y: 1,
        context: "Vertex",
        dim: "2D"
      },
      {
        x: 1,
        y: 0,
        context: "Vertex",
        dim: "2D"
      }
    ])


    const squareFace3d = new Face3D([{
      x: 0,
      y: 0,
      z: 0,
      context: "Vertex",
      dim: "3D"
    },
    {
      x: 0,
      y: 1,
      z: 0,
      context: "Vertex",
      dim: "3D"
    },
    {
      x: 1,
      y: 1,
      z: 0,
      context: "Vertex",
      dim: "3D"
    },
    {
      x: 1,
      y: 0,
      z: 0,
      context: "Vertex",
      dim: "3D"
    }
  ],
  0.5,
  0,
  {
    x: 0,
    y: 0,
    z: 1,
    context: "Vertex",
    dim: "3D"
  },
  0n);

  createSplitFace([0n, 0n], [2n, 2n], squareFace2d, squareFace3d);


  });

});

