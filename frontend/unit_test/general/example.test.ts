/**
 * This is an example test file to check our javascript/typescript code
 * Make sure to run `npm install` to get the correct update
 */


import * as assert from 'assert';
// import { METHODS TO TEST HERE } from 'LOCALFILE';


// Note: normally you import the functions you want to test, but for now,
// I will write the function to test here:
const add = (a: number, b: number): number => {
  return a + b;
};

describe('Example Test', () => {
  it('Test add function', () => {
    assert.strictEqual(add(1, 2), 3); // Checks strict equality
  });
});