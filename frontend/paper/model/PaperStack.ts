/**
 * @fileoverview Implementation of the "Layered Undirected Graph" data
 * structure which tracks how layers of the paper stack on top of each other.
 */


/** 
 * Some terminology to help understand the kinds of folds and implementation of this file:
 * "Stable" angles refer to an angle between two faces of 0, 180, or 360.
 * Folds are classified by how they change the angles between faces as follows.
 * A fold is "complete" when its both start and end angle are stable.
 * A fold is "partial" when its start angle is stable, but its end angle is not.
 * A fold is "resolved" when its start angle is unstable, but its end angle is stable.
 * A fold is "adjusted" when both start and end angle are unstable.
 * 
 * Folds can also be classified by the changes they cause to the faces themselves.
 * A fold is a "split" fold when it causes faces to split. The start angle is 180.
 * A fold is a "merge" fold when it causes faces to merge. The final angle is 180.
 * A fold is an "align" fold when it results in no changes to faces. Therefore the
 * final angle cannot be 180 because then two faces would get merged. The start angle
 * cannot be 180 either because then by definition there would not be two faces,
 * and we would need to split them.
 * Folds can only ever be exactly one of these three kinds.
 * 
 * A "component" in the LUG is a connected component which indicates that
 * all faces in the component are technically overlapping in 3D space, if
 * the paper was infinitely thin.
 * 
 * There are four operations on components - two divides, two joins.
 * "Split" is for dividing components when faces are being split.
 * "Partition" is for dividing components when faces are not being split.
 * "Stack" is for joining components on top/bottom of each other.
 * "Merge" is for joining components when faces are being merged.
 * 
 * We need to implement the following kinds of folds.
 * Complete Split: 180 -> 0 or 360. Component is Split and Stacked.
 * Complete Merge: 0 or 360 -> 180. Components are Partitioned and Merged.
 * Partial Split: 180 -> nonstable. Component is Split.
 * Resolved Merge: nonstable -> 180. Components are Partitioned and Merged.
 * Partial Align: 0 or 360 -> nonstable. Components are Partitioned.
 * Resolved Align: nonstable -> 0 or 360. Components are Partitioned and Stacked.
 * Adjusted Align: nonstable -> nonstable. Nothing happens to the component.
 */


/**
 * One node in the LUG. 
 */
class FaceNode {

    readonly faceID: bigint;
    readonly upLinks: Set<bigint>;
    readonly downLinks: Set<bigint>;

    constructor(faceID: bigint) {
        this.faceID = faceID;
        this.upLinks = new Set<bigint>();
        this.downLinks = new Set<bigint>();
    }

}

/**
 * One component in the LUG.
 */
class PaperComponent {

    readonly ID: bigint;
    readonly layerMap: Map<bigint, bigint>;
    readonly layers: Set<FaceNode>[];
    
    constructor(ID: bigint) {
        this.ID = ID;
        this.layerMap = new Map<bigint, bigint>();
        this.layers = [];
    }

}

