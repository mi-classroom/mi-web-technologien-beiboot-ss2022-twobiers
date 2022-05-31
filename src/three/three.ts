import * as THREE from "three";
import { Raycaster } from "three";
import { DimensionizedCdaItem } from "../types";
import { animateControls } from "./controls";
import { getWebGLErrorMessage, isWebGL2Available, makeTextSprite } from "./utils";
import { Artwork3DObject } from "./objects/artwork";
import { camera, floor, renderer, scene } from "./objects/scene";
import pane from "./pane";

if(!isWebGL2Available()) {
    document.body.appendChild(getWebGLErrorMessage());
    throw new Error("WebGL is not supported");
}

// @ts-ignore
const _pane = pane; // Keep to show the pane

const raycaster = new THREE.Raycaster();

let artworkObjects: Artwork3DObject[] = [];

const highlightIntersectedArtworks = (rc: Raycaster) => {
    const intersectedArtworks = rc.intersectObjects<Artwork3DObject>(artworkObjects, false)
        .filter(intersection => intersection.distance < 100);
    for(const intersection of intersectedArtworks) {
        intersection.object.highlight();
    }

    // Unhighlight all "pending" - artworks not currently intersected, but highlighted
    const pendingHightlights = artworkObjects.filter(aw => aw.isHighlighted)
        .filter(aw => !intersectedArtworks.some(i => i.object === aw));
    for(const pending of pendingHightlights) {
        pending.unhighlight();
    }
};

const animate = () => {
    requestAnimationFrame( animate );

    animateControls();

    // Update floor to camera positon, so that it makes an illusion of infinite floor
    floor.position.set(camera.position.x, floor.position.y, camera.position.z);

    raycaster.setFromCamera(new THREE.Vector2(), camera);
    highlightIntersectedArtworks(raycaster);

    renderer.render( scene, camera );
};

const createArtworkObjects = (artworks: DimensionizedCdaItem[]) => Promise.all(artworks.map(art => Artwork3DObject.buildArtworkObject(art)));

const groupArtworkObjectsByDating = (objects: Artwork3DObject[]) => objects.reduce<Record<number, Artwork3DObject[]>>((acc, curr) => {
    const year = curr.userData.year;
    if(!acc[year]) {
        acc[year] = []
    }
    acc[year].push(curr);
    return acc;
}, {});

const createArtworkModelGroupOfYear = (year: number, objects: Artwork3DObject[]): THREE.Group => {
    const group = new THREE.Group();
    const artworkBox = new THREE.Box3();
    const groupBox = new THREE.Box3();
    const artworkBoxSize = new THREE.Vector3();
    const groupBoxSize = new THREE.Vector3();
    // Artworks will be placed NEXT to each other. 
    for(const element of objects) {
        artworkBox.setFromObject(element);
        groupBox.setFromObject(group);
        artworkBox.getSize(artworkBoxSize);
        groupBox.getSize(groupBoxSize);
        
        const x = groupBoxSize.x + artworkBoxSize.x;
        const y = artworkBoxSize.y / 2; // On ground
        const z = 0; // We don't need z as we're just two-dimensional in a group. The whole group will be moved on the z-axis
        element.position.set(x, y , z);
        
        group.add(element);
    }
    // Place a year indicator on top
    const label = makeTextSprite(`${year}`, { fontsize: 50 });
    label.position.set(0, 20, 0);
    group.add(label);

    return group;
};

export const setArtworks = async (artworks: DimensionizedCdaItem[]) => {
    // We sort the array by the dating to maintain consistency
    artworks = artworks.sort((a, b) => a.dating.begin - b.dating.begin);

    // First, we create all meshes from the artworks
    artworkObjects = await createArtworkObjects(artworks);

    // Next, we group them by their particular dating
    const groups = groupArtworkObjectsByDating(artworkObjects);

    // We create modeled groups
    const modeledGroups = Object.entries(groups).map(([year, arr]) => createArtworkModelGroupOfYear(Number(year), arr));

    let currentOffset = 0;
    const groupBox = new THREE.Box3();
    const groupBoxSize = new THREE.Vector3();
    for(const element of modeledGroups) {
        const group = element;
        groupBox.setFromObject(group);
        groupBox.getSize(groupBoxSize);

        group.position.set(0, group.position.y, currentOffset);
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