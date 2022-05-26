import * as THREE from "three";
import { Box3, Vector3 } from "three";
import { threadId } from "worker_threads";
import { DimensionizedCdaItem, ItemDimensions } from "../types";
import { animateControls, initControls } from "./controls";
import { makeTextSprite } from "./utils";

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
const artworks: Record<number, DimensionizedCdaItem[]> = {};

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
    return new THREE.Mesh(geometry, material);
};

const addArtwork = async (artwork: DimensionizedCdaItem, z: number) => {
    console.log(artwork);
    // Lets just stick to the begin dating to make things easy
    const year = artwork.dating.begin;

    const mesh = await createArtworkMesh(artwork);
    let y = 10;
    switch(artwork.dimensions.shape) {
        case "rectangle":
            const box = mesh.geometry.boundingBox ? mesh.geometry.boundingBox : new THREE.Box3().setFromObject(mesh);
            y = box.getSize(new Vector3()).y / 2;
            break;
        case "circle":
            y = artwork.dimensions.dimension.diameter * 2;
            break;
    }

    const x = ((artworks[year]?.length ?? 0) + 1) * 20;
    mesh.position.set(x, y, z);
    mesh.rotateY(-90 * Math.PI / 180); // Rotate to align on timeline

    scene.add(mesh);

    if(!artworks[year]) {
        artworks[year] = [];
        createTimelineEntry(`${year}`, z);
    }
    artworks[year].push(artwork);
};


const createTimelineEntry = (entry: string, z: number) => {
    const origin = new THREE.Vector3(0, 1, 0); // Preserve Axes helper, therefore move one level up

    const label = makeTextSprite(entry, { fontsize: 32 });
    label.position.set(origin.x, 10, z);
    scene.add(label);
};

export const setArtworks = async (artworks: DimensionizedCdaItem[]) => {
    // Just use the begin date as date source
    const years = artworks.map(item => item.dating.begin);
    const startYear = Math.min(...years);

    for(const artwork of artworks) {
        const z = Math.abs(startYear - artwork.dating.begin) * 128;
        addArtwork(artwork, z);
    }
};

export const getSceneCanvas = (): HTMLCanvasElement => {
    initScene();
    const controls = initControls(camera, renderer.domElement);
    scene.add(controls.getObject());

    animate();

    return renderer.domElement;
};