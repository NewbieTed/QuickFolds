/**
 * @fileoverview Base interface for animation object.
 */


export interface Animation {

    update(): void;
    isComplete(): boolean;

}