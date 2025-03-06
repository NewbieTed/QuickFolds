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
    readonly layers: Map<bigint, FaceNode>[];
    
    constructor(ID: bigint) {
        this.ID = ID;
        this.layerMap = new Map<bigint, bigint>();
        this.layers = [];
    }

}



/**
 * Splits the paper component, given the mapping of ancestor face IDs
 * to descendant face IDs, which must contain every face in this component
 * as a key. Splits based on the set of stationary faces, which should be a
 * subset of all the descendant faces of this component.
 * @param component The LUG component to split.
 * @param descendants Mapping of ancestor to descendant faces. If a face is
 *                    its own descendant, the map entry should <id, [id]>.
 * @param stationary Set of which faces are stationary.
 * @returns The stationary component and mobile component, in that order.
 */
function split(
            component: PaperComponent,
            descendants: Map<bigint, [bigint, bigint] | [bigint]>,
            stationary: Set<bigint>
            ): [PaperComponent, PaperComponent] {

    const stationaryComponent = new PaperComponent(getNextComponentID());
    const mobileComponent = new PaperComponent(getNextComponentID());

    // Iterate layer by layer and turn ancestors into descendants.
    for (let layer = 0n; layer < component.layers.length; layer++) {

        stationaryComponent.layers.push(new Map<bigint, FaceNode>);
        mobileComponent.layers.push(new Map<bigint, FaceNode>);

        // Consider one node, find its descendants and classify them.
        for (const faceID of component.layers[Number(layer)].keys()) {

            for (const descID of descendants.get(faceID)) {

                if (stationary.has(descID)) {
                    stationaryComponent.layers[Number(layer)].set(
                        descID, new FaceNode(descID)
                    );
                } else {
                    mobileComponent.layers[Number(layer)].set(
                        descID, new FaceNode(descID)
                    );
                }

            }

        }

    }

    // Now clean the components: Remove empty layers from the top and bottom.
    clean(stationaryComponent);
    clean(mobileComponent);

    // Next we set the maps from face IDS to which layer the face is in.
    setLayerMap(stationaryComponent);
    setLayerMap(mobileComponent);

    // Finally, set all of the uplinks and downlinks in each component, based
    // on the descendant mapping, layer mappings, and stationary set.
    // Iterate layer by layer and connect up descendants togethers.
    for (let layer = 0n; layer < component.layers.length; layer++) {

        const oldLayer = component.layers[Number(layer)];
        // Consider one node, iterate its uplinks and downlinks.
        for (const faceID of oldLayer.keys()) {

            // Set all of the downlinks.
            for (const downID of oldLayer.get(faceID).downLinks) {

                const descA = descendants.get(faceID);
                const descB = descendants.get(downID);

                const lenCase = 2 * (descA.length - 1) + (descB.length - 1);
                // 1, 1 --> 0
                // 1, 2 --> 1
                // 2, 1 --> 2
                // 2, 2 --> 3

                // Case 3: Both faces were split and have two descendents.
                if (lenCase === 3) {
                    if (pairs(stationary, descA[1], descB[1])) {

                        const toUpdate = (stationary.has(descA[1])) ?
                                          stationaryComponent : 
                                          mobileComponent;
                        addDownlink(toUpdate, descA[1], descB[1]);
                    }
                }
                // Case 2: Only one face was split (face A)
                if (lenCase === 3 || lenCase === 2) {
                    if (pairs(stationary, descA[1], descB[0])) {

                        const toUpdate = (stationary.has(descA[1])) ?
                                          stationaryComponent : 
                                          mobileComponent;
                        addDownlink(toUpdate, descA[1], descB[0]);
                    }
                }
                // Case 1: Only one face was split (face B)
                if (lenCase === 3 || lenCase === 1) {
                    if (pairs(stationary, descA[0], descB[1])) {

                        const toUpdate = (stationary.has(descA[0])) ?
                                          stationaryComponent : 
                                          mobileComponent;
                        addDownlink(toUpdate, descA[0], descB[1]);
                    }
                }
                // Case 0 (should always execute): Neither was split.
                if (pairs(stationary, descA[0], descB[0])) {

                    const toUpdate = (stationary.has(descA[0])) ?
                                      stationaryComponent : 
                                      mobileComponent;
                    addDownlink(toUpdate, descA[0], descB[0]);
                }

            }

            // Set all of the uplinks similarly.
            for (const upID of oldLayer.get(faceID).upLinks) {

                const descA = descendants.get(faceID);
                const descB = descendants.get(upID);

                const lenCase = 2 * (descA.length - 1) + (descB.length - 1);
                // 1, 1 --> 0
                // 1, 2 --> 1
                // 2, 1 --> 2
                // 2, 2 --> 3

                // Case 3: Both faces were split and have two descendents.
                if (lenCase === 3) {
                    if (pairs(stationary, descA[1], descB[1])) {

                        const toUpdate = (stationary.has(descA[1])) ?
                                          stationaryComponent : 
                                          mobileComponent;
                        addUplink(toUpdate, descA[1], descB[1]);
                    }
                }
                // Case 2: Only one face was split (face A)
                if (lenCase === 3 || lenCase === 2) {
                    if (pairs(stationary, descA[1], descB[0])) {

                        const toUpdate = (stationary.has(descA[1])) ?
                                          stationaryComponent : 
                                          mobileComponent;
                        addUplink(toUpdate, descA[1], descB[0]);
                    }
                }
                // Case 1: Only one face was split (face B)
                if (lenCase === 3 || lenCase === 1) {
                    if (pairs(stationary, descA[0], descB[1])) {

                        const toUpdate = (stationary.has(descA[0])) ?
                                          stationaryComponent : 
                                          mobileComponent;
                        addUplink(toUpdate, descA[0], descB[1]);
                    }
                }
                // Case 0 (should always execute): Neither was split.
                if (pairs(stationary, descA[0], descB[0])) {

                    const toUpdate = (stationary.has(descA[0])) ?
                                      stationaryComponent : 
                                      mobileComponent;
                    addUplink(toUpdate, descA[0], descB[0]);
                }

            }

        }

    }

    // Return the stationary component and mobile component.
    return [stationaryComponent, mobileComponent];
}


/**
 * Checks whether a given set which partitions some larger set either
 * contains both of the first and second IDs, or contains neither.
 * @param partition The set to check for separation of the IDs.
 * @param firstID The first ID.
 * @param secondID The second ID.
 * @returns True if both firstID and secondID are both in the set
 * or both not in the set. False when one of the two is in the set.
 */
function pairs(
            partition: Set<bigint>,
            firstID,
            secondID
            ): boolean {

    return partition.has(firstID) === partition.has(secondID);
}


/**
 * Adds an uplink to the given paper component, from the node with ID
 * faceID to the node in the next layer up, with ID upID.
 * @param component The component to update.
 * @param faceID The face to add a link to.
 * @param upID The face to link it to.
 */
function addUplink(
            component: PaperComponent, 
            faceID: bigint, 
            upID: bigint
            ) {

    component.layers[Number(component.layerMap.get(faceID))]
             .get(faceID).upLinks.add(upID);
}


/**
 * Adds a downlink to the given paper component, from the node with ID
 * faceID to the node in the next layer up, with ID upID.
 * @param component The component to update.
 * @param faceID The face to add a link to.
 * @param downID The face to link it to.
 */
function addDownlink(
            component: PaperComponent, 
            faceID: bigint, 
            downID: bigint
            ) {

    component.layers[Number(component.layerMap.get(faceID))]
             .get(faceID).downLinks.add(downID);
}


/**
 * Removes any empty layers from the top and bottom of the given component.
 * @param component The component to clean.
 */
function clean(component: PaperComponent): void {

    let firstBottom = 0;
    // Remove from the bottom of the component.
    while (component.layers.length > 0 &&
           component.layers[0].size == 0) {
     
        firstBottom++;
     }

    let firstTop = component.layers.length;
    // Remove from the top of the component.
    while (component.layers.length > 0 &&
           component.layers[component.layers.length - 1].size == 0) {
        
        firstTop--;
    }

    // Shift only the non-empty layers.
    let i = 0;
    for (let j = firstBottom; j < firstTop; j++) {
        component.layers[i] = component.layers[j];
        i++;
    }

    // Remove excess.
    while (i < component.layers.length) {
        component.layers.pop();
    }

}


/**
 * Iterates the paper component and updates the layerMap, which maps
 * face IDs to the particular layer they belong to.
 * @param component The component to update.
 */
function setLayerMap(component: PaperComponent): void {

    // Iterate layer by layer, check every node.
    for (let layer = 0n; layer < component.layers.length; layer++) {

        for (const faceID of component.layers[Number(layer)].keys()) {

            component.layerMap.set(faceID, layer);
        }

    }

}


/**
 * Splits the paper component, based on the set of stationary faces, 
 * which should be a subset of all the faces in this component. Unlike
 * split(), this operation assumes that no faces are created or deleted.
 * @param component The LUG component to split.
 * @param stationary Set of which faces are stationary.
 * @returns The stationary component and mobile component, in that order.
 */
function partition(
    component: PaperComponent,
    stationary: Set<bigint>
    ): [PaperComponent, PaperComponent] {

    const stationaryComponent = new PaperComponent(getNextComponentID());
    const mobileComponent = new PaperComponent(getNextComponentID());

    // Iterate layer by layer and turn ancestors into descendants.
    for (let layer = 0n; layer < component.layers.length; layer++) {

        stationaryComponent.layers.push(new Map<bigint, FaceNode>);
        mobileComponent.layers.push(new Map<bigint, FaceNode>);

        // Consider one node, classify it into the two components.
        for (const faceID of component.layers[Number(layer)].keys()) {

            if (stationary.has(faceID)) {
                stationaryComponent.layers[Number(layer)].set(
                    faceID, new FaceNode(faceID)
                );
            } else {
                mobileComponent.layers[Number(layer)].set(
                    faceID, new FaceNode(faceID)
                );
            }

        }

    }

    // Now clean the components: Remove empty layers from the top and bottom.
    clean(stationaryComponent);
    clean(mobileComponent);

    // Next we set the maps from face IDS to which layer the face is in.
    setLayerMap(stationaryComponent);
    setLayerMap(mobileComponent);

// Finally, set all of the uplinks and downlinks in each component, based
    // on the layer mappings and stationary set.
    // Iterate layer by layer and connect up the nodes in the same set. 
    for (let layer = 0n; layer < component.layers.length; layer++) {

        const oldLayer = component.layers[Number(layer)];
        // Consider one node, iterate its uplinks and downlinks.
        for (const faceID of oldLayer.keys()) {

            // Set all of the downlinks.
            for (const downID of oldLayer.get(faceID).downLinks) {

                if (pairs(stationary, faceID, downID)) {

                    const toUpdate = (stationary.has(faceID)) ?
                                      stationaryComponent : 
                                      mobileComponent;
                    addDownlink(toUpdate, faceID, downID);
                }

            }

            // Set all of the uplinks similarly.
            for (const upID of oldLayer.get(faceID).upLinks) {

                if (pairs(stationary, faceID, upID)) {

                    const toUpdate = (stationary.has(faceID)) ?
                                      stationaryComponent : 
                                      mobileComponent;
                    addUplink(toUpdate, faceID, upID);
                }

            }

        }

    }

    // Return the stationary component and mobile component.
    return [stationaryComponent, mobileComponent];
}


function getNextComponentID() {
    // TODO
    return 0n;
}