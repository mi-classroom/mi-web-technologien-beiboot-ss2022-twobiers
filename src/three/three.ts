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
        
        element.rotateY(-90 * Math.PI / 180);
        element.position.set(20, artworkBoxSize.y / 2, groupBoxSize.z + (artworkBoxSize.x / 2));
        
        group.add(element);
    }    
    // Place a year indicator on top
    const label = makeTextSprite(`${year}`, { fontsize: 50 });
    label.position.set(20, 20, 0);
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

        group.position.set(group.position.x, group.position.y, currentOffset);

        groupBox.setFromObject(group);
        groupBox.getSize(groupBoxSize);
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