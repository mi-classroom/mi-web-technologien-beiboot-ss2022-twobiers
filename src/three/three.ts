import * as THREE from "three";
import { Object3D, Vector3 } from "three";
import { DimensionizedCdaItem, ItemDimensions } from "../types";
import { animateControls, initControls } from "./controls";
import { calcSurfaceArea, makeTextSprite } from "./utils";

// TODO: Proper typing
type ArtworkUserData = { 
    year: number,
    rawItem: DimensionizedCdaItem 
};
type ArtworkObject = Object3D;

const renderer = new THREE.WebGLRenderer( { antialias: true } );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const scene = new THREE.Scene();

// Add Floor
const floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
const floorMaterial = new THREE.MeshBasicMaterial( { 
    color: 0x565656
} );
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// object where artworks added to the scene will be saved with their dating as key.
//const artworkObjects: Record<number, Object3D[]> = {};

scene.add(new THREE.AxesHelper(100));

const initScene = () => {
    camera.position.set(-10, 10, -10);
    camera.rotation.set(0, 180 * Math.PI / 180, 0); // Turn aroundas

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    scene.background = new THREE.Color( 0x878787 );
	scene.fog = new THREE.Fog( 0x878787, 0, 750 );

    floor.rotateX(-Math.PI / 2);
    scene.add(floor);

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }, false);
};

const render = () => {
    renderer.render(scene, camera);
};

const animate = () => {
    requestAnimationFrame( animate );

    animateControls();

    // Update floor to camera positon, so that it makes an illusion of infinite floor
    floor.position.set(camera.position.x, floor.position.y, camera.position.z);

    renderer.render( scene, camera );

};

const createGeometry = (dimensions: ItemDimensions): THREE.BufferGeometry => {
    switch(dimensions.shape) {
        case "circle":
            return new THREE.CircleGeometry(dimensions.dimension.diameter / 2, 32);
        case "rectangle":
            return new THREE.BoxGeometry(dimensions.dimension.width, dimensions.dimension.height, dimensions.dimension.depth);
    }
};

const createArtworkMesh = async (artwork: DimensionizedCdaItem): Promise<THREE.Mesh> => {
    const geometry = createGeometry(artwork.dimensions);
    const url = artwork.images.overall.images[0].sizes.medium.src.replaceAll("imageserver-2022", "data-proxy/image.php?subpath=");
    const texture = await new THREE.TextureLoader().loadAsync(url);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        map: texture
    });
    const mesh = new THREE.Mesh(geometry, material);

    const year = artwork.dating.begin;
    mesh.userData = {
        year,
        rawItem: artwork
    } as ArtworkUserData;

    return mesh;
};

const createArtworkObjects = (artworks: DimensionizedCdaItem[]): Promise<ArtworkObject[]> => Promise.all(artworks.map(art => createArtworkMesh(art)));

const groupArtworkObjectsByDating = (objects: ArtworkObject[]): Record<number, ArtworkObject[]> => objects.reduce((acc, curr) => {
    const year = (curr.userData as ArtworkUserData).year;
    console.log(curr);
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
    const artworkObjects = await createArtworkObjects(artworks);

    // Next, we group them by their particular dating
    const groups = groupArtworkObjectsByDating(artworkObjects);
    console.log(groups);

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
    initScene();
    const controls = initControls(camera, renderer.domElement);
    scene.add(controls.getObject());

    animate();

    return renderer.domElement;
};