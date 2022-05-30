import * as THREE from "three";
import { Material, Mesh, MeshBasicMaterial, Object3D, Raycaster, Scene, Vector3 } from "three";
import { DimensionizedCdaItem, ItemDimensions } from "../types";
import { animateControls, controlProperties, createControls } from "./controls";
import { calcSurfaceArea, getWebGLErrorMessage, isWebGL2Available, makeTextSprite } from "./utils";
import { crosshair } from "./objects/crosshair";
import { ArtworkObject, isArtworkObject, artworkProperties, Artwork3DObject } from "./objects/artwork";
import { camera, floor, renderer, scene } from "./objects/scene";
import pane from "./pane";


if(!isWebGL2Available()) {
    document.body.appendChild(getWebGLErrorMessage());
    throw new Error("WebGL is not supported");
}

const _pane = pane; // Keep to show the pane

const raycaster = new THREE.Raycaster();

let artworkObjects: Artwork3DObject[] = [];

const highlightIntersectedArtworks = (rc: Raycaster) => {
    const intersectedArtworks: THREE.Intersection<Artwork3DObject>[] = (rc.intersectObjects(artworkObjects, false) as any as THREE.Intersection<Artwork3DObject>[])
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

const createArtworkObjects = (artworks: DimensionizedCdaItem[]): Promise<Artwork3DObject[]> => Promise.all(artworks.map(art => Artwork3DObject.buildArtworkObject(art)));

const groupArtworkObjectsByDating = (objects: ArtworkObject[]): Record<number, ArtworkObject[]> => objects.reduce((acc, curr) => {
    const year = curr.userData.year;
    if(!acc[year]) {
        acc[year] = []
    }
    acc[year].push(curr);
    return acc;
}, {} as Record<number, ArtworkObject[]>);

const createArtworkModelGroupOfYear = (year: number, objects: ArtworkObject[]): THREE.Group => {
    const group = new THREE.Group();

    // Place a year indicator at the front
    const label = makeTextSprite(`${year}`, { fontsize: 86 });
    label.position.set(0, 20, 0);
    group.add(label);

    // Artworks will be placed NEXT to each other. 
    for(const element of objects) {
        const artwork = element;
        const artworkBox = new THREE.Box3().setFromObject(artwork);
        const groupBox = new THREE.Box3().setFromObject(group);
        const artworkBoxSize = artworkBox.getSize(new THREE.Vector3());
        const groupBoxSize = groupBox.getSize(new THREE.Vector3());
        
        artwork.rotateY(-90 * Math.PI / 180);
        artwork.position.set(20, artworkBoxSize.y / 2, groupBoxSize.z + (artworkBoxSize.x / 2));
        
        group.add(artwork);
    }

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
    for(const element of modeledGroups) {
        const group = element;

        group.position.set(group.position.x, group.position.y, currentOffset);

        const groupBox = new THREE.Box3().setFromObject(group);
        const groupBoxSize = groupBox.getSize(new THREE.Vector3());
        currentOffset += groupBoxSize.z + 20;

        const helper = new THREE.BoxHelper(group, 0xff0000);
        helper.update();
        scene.add(helper);
        scene.add(group);
    }
};

export const getSceneCanvas = (): HTMLCanvasElement => {
    const controls = createControls(camera, renderer.domElement);
    scene.add(controls.getObject());

    animate();

    return renderer.domElement;
};