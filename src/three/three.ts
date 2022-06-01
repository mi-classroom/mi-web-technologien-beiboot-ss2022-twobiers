import * as THREE from "three";
import { Raycaster } from "three";
import { DimensionizedCdaItem } from "../types";
import { animateControls } from "./controls";
import { getWebGLErrorMessage, isWebGL2Available } from "./utils";
import { Artwork3DObject } from "./objects/artwork";
import { camera, floor, renderer, scene } from "./objects/scene";
import pane, { fpsGraph } from "./pane";
import { createArtworkModelGroupOfYear } from "./objects/artworkGroup";

if(!isWebGL2Available()) {
    document.body.appendChild(getWebGLErrorMessage());
    throw new Error("WebGL is not supported");
}

// @ts-ignore
const _pane = pane; // Keep to show the pane

const raycaster = new THREE.Raycaster();

let artworkObjects: Artwork3DObject[] = [];
let intersections: THREE.Intersection<Artwork3DObject>[] = [];

const highlightIntersectedArtworks = (rc: Raycaster) => {
    intersections.length = 0;
    const nearest = rc.intersectObjects<Artwork3DObject>(artworkObjects, false, intersections)
        .find(intersection => intersection.distance < 100);
    
    // Only highlight first
    if (nearest) {
        nearest.object.highlight();
    }

    // Unhighlight all "pending" - artworks not currently intersected, but highlighted
    const pendingHightlights = artworkObjects.filter(aw => aw.isHighlighted && nearest?.object?.id !== aw.id);
    for(const pending of pendingHightlights) {
        pending.unhighlight();
    }
};

const animate = () => {
    //@ts-ignore
    fpsGraph.begin();
    
    requestAnimationFrame( animate );

    animateControls();

    // Update floor to camera positon, so that it makes an illusion of infinite floor
    floor.position.set(camera.position.x, floor.position.y, camera.position.z);

    raycaster.setFromCamera(new THREE.Vector2(), camera);
    highlightIntersectedArtworks(raycaster);

    renderer.render( scene, camera );
    
    //@ts-ignore
    fpsGraph.end();
};

const createArtworkObjects = (artworks: DimensionizedCdaItem[]) => Promise.all(artworks.map(art => Artwork3DObject.buildArtworkObject(art)));

const groupArtworkObjectsByDating = (objects: Artwork3DObject[], preserveGaps?: boolean) => {
    const grouped = objects.reduce<Record<number, Artwork3DObject[]>>((acc, curr) => {
        const year = curr.userData.year;
        if(!acc[year]) {
            acc[year] = []
        }
        acc[year].push(curr);
        return acc;
    }, {});

    if(!preserveGaps) {
        return grouped;
    }

    // Could have been done in the reduce method, but this would assume ordering.
    // We are ordering the artworks beforehand, but we cannot assume that within
    // this function. We could sort the objects before but this would be pointless
    // if we're not preserving the gaps.
    // This approach should (hopefully) be the best option in terms of reliablity, 
    // maintainability and clarity. 
    const years = Object.keys(grouped).map(year => Number(year));
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    for(let i = minYear; i < maxYear; ++i) {
        if(!grouped[i]) {
            grouped[i] = [];
        }
    }

    return grouped;
}

export const setArtworks = async (artworks: DimensionizedCdaItem[]) => {
    // We sort the array by the dating to maintain consistency
    artworks = artworks.sort((a, b) => a.dating.begin - b.dating.begin);

    // First, we create all meshes from the artworks
    artworkObjects = await createArtworkObjects(artworks);

    // Next, we group them by their particular dating
    const groups = groupArtworkObjectsByDating(artworkObjects, true);

    // We create modeled groups
    const modeledGroups = Object.entries(groups).map(([year, arr]) => createArtworkModelGroupOfYear(Number(year), arr));

    let currentOffset = 0;
    const groupBox = new THREE.Box3();
    const groupBoxSize = new THREE.Vector3();
    for(const element of modeledGroups) {
        const group = element;
        groupBox.setFromObject(group);
        groupBox.getSize(groupBoxSize);

        group.position.setZ(currentOffset);
        // group.position.set(0, group.position.y, currentOffset);
        group.rotation.set(0, 180 * Math.PI / 180, 0); // Flip the group to right align it on the z-axis. Not really smart but pragmatic

        currentOffset += groupBoxSize.z + 20;

        const helper = new THREE.BoxHelper(group, 0xff0000);
        helper.update();
        scene.add(helper);
        scene.add(group);
    }
};

export const getSceneCanvas = (): HTMLCanvasElement => {
    animate();
    return renderer.domElement;
};