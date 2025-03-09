/**
 * @fileoverview Implementation of the "Layered Undirected Graph" data
 * structure which tracks how layers of the paper stack on top of each other.
 */

import * as pt from "../geometry/Point.js"
import * as geo from "../geometry/geometry.js"
import * as SceneManager from "../view/SceneManager.js"


/** 
 * Some terminology to help understand the kinds of folds and implementation of this file:
 * 
 * "Stable" angles refer to an angle between two faces of 0, 180, or 360.
 * 
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
 * Complete Align: 0 or 360 -> 360 or 0. Components are Partitioned and Stacked.
 * Partial Align: 0 or 360 -> nonstable. Components are Partitioned.
 * Resolved Align: nonstable -> 0 or 360. Components are Partitioned and Stacked.
 * Adjusted Align: nonstable -> nonstable. Nothing happens to the component.
 * 
 * (Any other combinations of the above vocabulary are impossible.)
 */


/**
 * One node in the LUG. 
 */
class FaceNode {

    readonly faceID: bigint;
    upLinks: Set<bigint>;
    downLinks: Set<bigint>;
    orientation: boolean;
    // orientation is whether the principal normal of the face 3d
    // aligns with the increasing layer direction of this component.

    constructor(faceID: bigint, orientation: boolean) {
        this.faceID = faceID;
        this.upLinks = new Set<bigint>();
        this.downLinks = new Set<bigint>();
        this.orientation = orientation;
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
                        descID, new FaceNode(
                            descID,
                            component.layers[Number(layer)].get(faceID).orientation
                        )
                    );
                } else {
                    mobileComponent.layers[Number(layer)].set(
                        descID, new FaceNode(
                            descID,
                            component.layers[Number(layer)].get(faceID).orientation
                        )
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
                    faceID, new FaceNode(
                        faceID,
                        component.layers[Number(layer)].get(faceID).orientation
                    )
                );
            } else {
                mobileComponent.layers[Number(layer)].set(
                    faceID, new FaceNode(
                        faceID,
                        component.layers[Number(layer)].get(faceID).orientation
                    )
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

    // Flip the layer order of the mobile component.
    invert(mobileComponent);

    // Return the stationary component and mobile component.
    return [stationaryComponent, mobileComponent];
}


/**
 * Joins two paper component by stacking the second on TOP of the first.
 * @param botComponent The component to stack on the bottom.
 * @param topComponent The component to invert and stack on the top.
 * @returns The modified botComponent (which now has topComponent stacked).
 * ___
 */
function stack(
            botComponent: PaperComponent,
            topComponent: PaperComponent,
            anchoredFaceID: bigint,
            foldEdgeID: bigint,
            deltaAngle: number
            ): PaperComponent {


    // Transform all of the top faces by the rotation.
    const [foldStart, foldEnd] = geo.resolveFoldDirection(
                                     anchoredFaceID, foldEdgeID);
    const rotatedFaces = new Map<bigint, pt.Point3D[]>();
    for (const faceID of topComponent.layerMap.keys()) {
        const rotatedVertices = geo.rotateVertices(
            SceneManager.getFace3DByID(faceID).vertices,
            foldStart,
            foldEnd,
            deltaAngle
        );
        rotatedFaces.set(faceID, rotatedVertices);
    }

    // Get a basis and turn every face into that 2D basis.
    const facesIn2D = new Map<bigint, pt.Point2D[]>();
    const firstFaceID: bigint = topComponent.layerMap.keys().next().value;
    const basis = geo.getPlaneBasisFromVertices(
        rotatedFaces.get(firstFaceID),
        SceneManager.getFace3DByID(firstFaceID).getPrincipleNormal()
    );
    for (const faceID of rotatedFaces.keys()) {
        facesIn2D.set(
            faceID,
            geo.projectToPlane(basis, 
                ...rotatedFaces.get(faceID)),
        );
    }
    for (const faceID of botComponent.layerMap.keys()) {
        facesIn2D.set(
            faceID,
            geo.projectToPlane(basis,
                ...SceneManager.getFace3DByID(faceID).vertices
            ),
        );
    }

    // First, we find the index of "bounding" layer in bot; this is the
    // layer right below where we could begin placing top.

    let boundLayer = 0n;
    const topOfBot = BigInt(botComponent.layers.length) - 1n;
    const topOfTop = BigInt(topComponent.layers.length) - 1n;

    // Descend from the top layer of the top component.
    for (let i = topOfTop; i >= 0; i--) {

        // Check every face of this layer in the top component.
        for (const topFaceID of topComponent.layers[Number(i)].keys()) {

            // Descend from the top until the face intersects some layer.
            for (let j = topOfBot; j >= boundLayer; j--) {
                
                // Does the face intersect this layer?
                let intersectsLayer = false;
                for (const botFaceID of botComponent.layers[Number(j)].keys()) {
                    // Check every face in this layer.
                    const intersectsFace = geo.faceIntersectionByVertices(
                        facesIn2D.get(topFaceID), facesIn2D.get(botFaceID)
                    );

                    // Stop once one bot face intersects this top face.
                    if (intersectsFace) {
                        intersectsLayer = true;
                        break;
                    }

                }

                // Stop once we found the bounding layer for the top face.
                if (intersectsLayer) {
                    boundLayer = j - (topOfTop - i);
                    break;
                }

            }

            // If the bounding layer is already the topmost layer, stop.
            if (boundLayer === topOfBot) {
                break;
            }

        }

        // If the bounding layer is already the topmost layer, stop.
        if (boundLayer === topOfBot) {
            break;
        }
    }

    
    // Now we do the stacking, starting at the bound layer and moving up.
    for (let i = 0n; i < topOfTop; i++) {

        // Assume the layers from boundLayer to the top of bottom correspond
        // one to one with the layers of the top component.
        // (That is, they have been compressed already, no empty layers)
        
        // Add new layer to bottom component if necessary.
        if (boundLayer + i + 1n === topOfBot) {
            botComponent.layers.push(new Map<bigint, FaceNode>());
        }

        // Iterate the top component's faces in this layer.
        for (const topFaceID of topComponent.layers[Number(topOfTop - i)].keys()) {

            // Add the face to the layer, update layer mapping.
            botComponent.layers[Number(boundLayer + i + 1n)]
                .set(topFaceID, new FaceNode(
                    topFaceID,
                    !topComponent.layers[Number(topOfTop - i)].get(topFaceID).orientation
                ));
            botComponent.layerMap.set(topFaceID, boundLayer + i + 1n);

            // Iterate the bot component's faces in the corresponding layer.
            for (const botFaceID of botComponent.layers[Number(boundLayer + i)].keys()) {
                // Check every face in this layer.
                const intersectsFace = geo.faceIntersectionByVertices(
                    facesIn2D.get(topFaceID), facesIn2D.get(botFaceID)
                );

                // Create uplinks/downlinks.
                if (intersectsFace) {
                    addUplink(botComponent, botFaceID, topFaceID);
                    addDownlink(botComponent, topFaceID, botFaceID);
                }

            }

        }
        

    }
    
    return botComponent;
}



/**
 * Merges two paper components, given the mapping of ancestor face IDs
 * to descendant face IDs, which must contain every face in the two components
 * as a key.
 * @param componentA The first LUG component to merge.
 * @param componentB The second LUG component to merge.
 * @param descendants Mapping of ancestor to descendant faces. If a face is
 *                    its own descendant, the map entry should <id, [id]>.
 * @returns The new merged component.
 */
function merge(
    componentA: PaperComponent,
    componentB: PaperComponent,
    descendants: Map<bigint, [bigint] | [bigint, bigint]>,
    ): PaperComponent {

    const mergedComponent = new PaperComponent(getNextComponentID());

    // Create the correct number of layers for the merged component.
    const numLayers =  Math.max(componentA.layers.length, componentB.layers.length);
    for (let i = 0n; i < numLayers; i++) {
        mergedComponent.layers.push(new Map<bigint, FaceNode>());
    }

    // Iterate first component layer by layer and turn ancestors into descendants.
    for (let layer = 0n; layer < componentA.layers.length; layer++) {

        // Consider one node, find its descendant.
        for (const faceID of componentA.layers[Number(layer)].keys()) {

            // Create descendant in merged component if not already existing.
            const descID = descendants.get(faceID)[0];
            if (!mergedComponent.layers[Number(layer)].has(descID)) {
                mergedComponent.layers[Number(layer)].set(
                    descID, new FaceNode(
                        descID,
                        componentA.layers[Number(layer)].get(faceID).orientation
                    )
                );
            }

        }

    }

    // Iterate second component and turn ancestors into descendants.
    for (let layer = 0n; layer < componentB.layers.length; layer++) {

        // Consider one node, find its descendant.
        for (const faceID of componentB.layers[Number(layer)].keys()) {

            // Create descendant in merged component if not already existing.
            const descID = descendants.get(faceID)[0];
            if (!mergedComponent.layers[Number(layer)].has(descID)) {
                mergedComponent.layers[Number(layer)].set(
                    descID, new FaceNode(
                        descID,
                        componentB.layers[Number(layer)].get(faceID).orientation
                    )
                );
            }

        }

    }

    // Now clean the component: Remove empty layers from the top and bottom.
    clean(mergedComponent);

    // Next we set the maps from face IDS to which layer the face is in.
    setLayerMap(mergedComponent);

    // Finally, set all of the uplinks and downlinks in each component, based
    // on the descendant mapping and layer mappings.

    // Iterate layer by layer of the first component and connect up descendants togethers.
    for (let layer = 0n; layer < componentA.layers.length; layer++) {

        const oldLayer = componentA.layers[Number(layer)];
        // Consider one node, iterate its uplinks and downlinks.
        for (const faceID of oldLayer.keys()) {

            // Set all of the downlinks.
            for (const downID of oldLayer.get(faceID).downLinks) {

                const desc1 = descendants.get(faceID)[0];
                const desc2 = descendants.get(downID)[0];

                addDownlink(mergedComponent, desc1, desc2);

            }

            // Set all of the uplinks similarly.
            for (const upID of oldLayer.get(faceID).upLinks) {

                const desc1 = descendants.get(faceID)[0];
                const desc2 = descendants.get(upID)[0];

                addUplink(mergedComponent, desc1, desc2);

            }

        }

    }

    // Iterate layer by layer of the second component and connect up descendants togethers.
    for (let layer = 0n; layer < componentB.layers.length; layer++) {

        const oldLayer = componentB.layers[Number(layer)];
        // Consider one node, iterate its uplinks and downlinks.
        for (const faceID of oldLayer.keys()) {

            // Set all of the downlinks.
            for (const downID of oldLayer.get(faceID).downLinks) {

                const desc1 = descendants.get(faceID)[0];
                const desc2 = descendants.get(downID)[0];

                addDownlink(mergedComponent, desc1, desc2);

            }

            // Set all of the uplinks similarly.
            for (const upID of oldLayer.get(faceID).upLinks) {

                const desc1 = descendants.get(faceID)[0];
                const desc2 = descendants.get(upID)[0];

                addUplink(mergedComponent, desc1, desc2);

            }

        }

    }


    // Return the stationary component and mobile component.
    return mergedComponent;
}


/**
 * Flips the component's layers upside down, in place.
 * ___
 */
export function invert(component: PaperComponent) {

    const numLayers = BigInt(component.layers.length);
    component.layers.reverse();
    for (let i = 0n; i < numLayers; i++) {
 
        for (const faceID of component.layers[Number(i)].keys()) {

            // Invert uplinks and downlinks for each node.
            const node = component.layers[Number(i)].get(faceID);
            const up = node.upLinks;
            const down = node.downLinks;
            node.upLinks = down;
            node.downLinks = up;
            node.orientation = !node.orientation;

            // Invert the layer mapping using simple math.
            component.layerMap.set(
                faceID, numLayers - 1n - component.layerMap.get(faceID)
            );
        }

    }

}


/**
 * Returns true if the principal normal of the given face is aligned with
 * the increasing-numbered layer direction of it's corresponding component.
 * ___
 */
function getOrientation(component: PaperComponent, faceID: bigint): boolean {
    const layer = component.layerMap.get(faceID);
    return component.layers[Number(layer)].get(faceID).orientation;
}


// TODO: Stack and Partition are incomplete / buggy in some cases: they both
// assume that the components involved are fully compressed, with no possible
// empty layers of paper in the middle. In the future, stack needs to compress
// the layers of the one being stacked, and partition needs to decompress those.
// This would mean stack/partition require connection mappings.


// -------------------------------------------------------------------------------------------------------------

// Code to initialize the LUG.
const LUG = new Map<bigint, PaperComponent>();
const faceToComponent = new Map<bigint, bigint>();
const initialComponent = new PaperComponent(0n);
const initialFace = new FaceNode(0n, true);
initialComponent.layerMap.set(0n, 0n);
initialComponent.layers.push(new Map<bigint, FaceNode>());
initialComponent.layers[0].set(0n, initialFace);
LUG.set(0n, initialComponent);
faceToComponent.set(0n, 0n);
let nextComponentID = 1n;


function getNextComponentID() {
    nextComponentID++;
    return nextComponentID - 1n;
}


/**
 * Gets the list of faces that overlap the face with the given ID.
 * This list WILL include the requested face itself.
 * ___
 */
export function getOverlappingFaces(faceID: bigint): bigint[] {
    const component = LUG.get(faceToComponent.get(faceID));
    const result = [];
    for (const face of component.layerMap.keys()) {
        result.push(face);
    }
    return result;
}


/**
 * Perform a merge or split type fold. Alters faces, and so we do
 * require stationary set and descendant mapping. Returns a map of
 * face ID to how their offsets should change.
 * ___
 */
export function faceMutatingFold(
            refStationary: bigint, // A particular stationary face.
            refMobile: bigint, // A particular mobile face adjacent to refStationary.
            startAngle: bigint, // The starting angle between refStationary and refMobile.
            endAngle: bigint, // The ending angle between refStationary and refMobile.
            foldEdgeID: bigint, //The ID of the fold edge in refStationary
            descendants: Map<bigint, [bigint, bigint] | [bigint]>,
            stationary: Set<bigint>
            ): Map<bigint, number> {
    
    const offsets = new Map<bigint, number>();

    if (startAngle === 180n && endAngle === 360n) {
        // Complete Split Case 1.
        const initialComponent = LUG.get(descendants.keys().next().value);
        const [stationaryComponent, mobileComponent] = split(
            initialComponent, descendants, stationary
        );
        
        // 360: The principal normals point away from each other.
        // So make both components have normals pointing opposite to the layering.
        // Then stack the stationary on top of the mobile.
        const statOrientation = getOrientation(stationaryComponent, refStationary);
        const mobOrientation = getOrientation(mobileComponent, refMobile);
        
        if (statOrientation) {
            invert(stationaryComponent);
        }
        if (mobOrientation) {
            invert(mobileComponent);
        }
        
        const result = stack(
            mobileComponent,  // Bottom (inverted)
            stationaryComponent, // Top (double inverted)
            refStationary,
            foldEdgeID,
            -180 // in the same direction as the stationary reference normal
        );

        // Capture how the Face3D offsets should change.
        const statOffset = (result.layers.length - stationaryComponent.layers.length);
        const mobOffset = -1 * (result.layers.length - mobileComponent.layers.length);
        for (const faceID of result.layerMap.keys()) {
            // Which one did it come from? Check orientation and offset accordingly.
            if (stationaryComponent.layerMap.has(faceID)) {
                offsets.set(
                    faceID, 
                    ((getOrientation(result, faceID)) ? 1 : -1)
                        * statOffset
                );
            } else {
                offsets.set(
                    faceID, 
                    ((getOrientation(result, faceID)) ? 1 : -1)
                        * mobOffset
                );
            }
        }
        
        // Update LUG components.
        LUG.delete(initialComponent.ID);
        LUG.set(result.ID, result);

    } else if (startAngle === 180n && endAngle === 0n) {
        // Complete Split Case 2.
        const initialComponent = LUG.get(descendants.keys().next().value);
        const [stationaryComponent, mobileComponent] = split(
            initialComponent, descendants, stationary
        );
        
        // 0: The principal normals point towards from each other.
        // So make both components have normals the same direction as the layering.
        // Then stack the mobile on top of the stationary.
        const statOrientation = getOrientation(stationaryComponent, refStationary);
        const mobOrientation = getOrientation(mobileComponent, refMobile);
        
        if (!statOrientation) {
            invert(stationaryComponent);
        }
        if (!mobOrientation) {
            invert(mobileComponent);
        }
        
        const result = stack(
            stationaryComponent,  // Bottom (upright)
            mobileComponent, // Top (inverted)
            refStationary,
            foldEdgeID,
            180 // in the opposite direction as the stationary reference normal
        );

        // Capture how the Face3D offsets should change.
        const statOffset = -1 * (result.layers.length - stationaryComponent.layers.length);
        const mobOffset = (result.layers.length - mobileComponent.layers.length);
        for (const faceID of result.layerMap.keys()) {
            // Which one did it come from? Check orientation and offset accordingly.
            if (stationaryComponent.layerMap.has(faceID)) {
                offsets.set(
                    faceID, 
                    ((getOrientation(result, faceID)) ? 1 : -1)
                        * statOffset
                );
            } else {
                offsets.set(
                    faceID, 
                    ((getOrientation(result, faceID)) ? 1 : -1)
                        * mobOffset
                );
            }
        }

        // Update LUG components.
        LUG.delete(initialComponent.ID);
        LUG.set(result.ID, result);

    } else if (startAngle === 180n) {
        // Partial Split
        const initialComponent = LUG.get(descendants.keys().next().value);
        const [stationaryComponent, mobileComponent] = split(
            initialComponent, descendants, stationary
        );
        
        // 0: The principal normals point towards from each other.
        // So make both components have normals the same direction as the layering.
        // Then stack the mobile on top of the stationary.
        const statOrientation = getOrientation(stationaryComponent, refStationary);
        const mobOrientation = getOrientation(mobileComponent, refMobile);
        
        if (!statOrientation) {
            invert(stationaryComponent);
        }
        if (!mobOrientation) {
            invert(mobileComponent);
        }
        
        const result = stack(
            stationaryComponent,  // Bottom (upright)
            mobileComponent, // Top (inverted)
            refStationary,
            foldEdgeID,
            Number(startAngle - endAngle)
        );

        // Partial Splits don't cause changes to offset.

        // Update LUG components.
        LUG.delete(initialComponent.ID);
        LUG.set(result.ID, result);

    } else if (startAngle === 360n && endAngle === 180n) {
        // Complete Merge Case 1.
        // TODO

    } else if (startAngle === 0n && endAngle === 180n) {
        // Complete Merge Case 2.
        // TODO

    } else if (endAngle === 180n) {
        // Resolved Merge
        // TODO
    }
    // No other cases should be possible for face-mutating folds.
        
    return offsets;
}

export function faceAlignFold(
            refStationary: bigint, // A particular stationary face.
            refMobile: bigint, // A particular mobile face adjacent to refStationary.
            startAngle: bigint, // The starting angle between refStationary and refMobile.
            endAngle: bigint, // The ending angle between refStationary and refMobile.
            stationary: Set<bigint>
            ): Map<bigint, number> {

    //TODO
    return null;
}

/* 
 * Complete Split: 180 -> 0 or 360. Component is Split and Stacked.
 * Complete Merge: 0 or 360 -> 180. Components are Partitioned and Merged.
 * Partial Split: 180 -> nonstable. Component is Split.
 * Resolved Merge: nonstable -> 180. Components are Partitioned and Merged.
 * Complete Align: 0 or 360 -> 360 or 0. Components are Partitioned and Stacked.
 * Partial Align: 0 or 360 -> nonstable. Components are Partitioned.
 * Resolved Align: nonstable -> 0 or 360. Components are Partitioned and Stacked.
 * Adjusted Align: nonstable -> nonstable. Nothing happens to the component.
 */