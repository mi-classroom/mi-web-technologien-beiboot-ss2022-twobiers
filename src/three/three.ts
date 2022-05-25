import * as THREE from "three";
import { Box3, Vector3 } from "three";
import { DimensionizedCdaItem, ItemDimensions } from "../types";
import { animateControls, initControls } from "./controls";
import { makeTextSprite } from "./utils";

const renderer = new THREE.WebGLRenderer( { antialias: true } );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const scene = new THREE.Scene();

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

    // Add Floor
    const floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
    const floorMaterial = new THREE.MeshBasicMaterial( { 
        color: 0x565656
    } );
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
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
    }
    artworks[year].push(artwork);
};


const createTimeline = (startYear: number, endYear: number, spacing: number = 40) => {
    const yearDiff = endYear - startYear;
    if(yearDiff <= 0) {
        throw new Error("Invalid years provided, difference must be greater than 0");
    }

    const dir = new THREE.Vector3(0, 0, 1); // direction alignment on z-axis
    const origin = new THREE.Vector3(0, 1, 0); // Preserve Axes helper, therefore move one level up
    const lengthOfYear = new THREE.Vector3(1, 0, 0).length() * spacing;

    for(let year = startYear; year <= endYear; ++year) {
        const startLabel = makeTextSprite(`${year}`, { fontsize: 32 });
        const offsetZ = origin.z + Math.abs(startYear - year) * lengthOfYear;
        startLabel.position.set(origin.x, 10, offsetZ);
        scene.add(startLabel);
    }

    const length = yearDiff * lengthOfYear;
    const color = 0xffff00;
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, color, 1, 1);

    scene.add(arrowHelper);
};

export const setArtworks = async (artworks: DimensionizedCdaItem[]) => {
    // Just use the begin date as date source
    const years = artworks.map(item => item.dating.begin);
    const startYear = Math.min(...years);
    const endYear = Math.max(...years);
    createTimeline(startYear, endYear);

    for(const artwork of artworks) {
        const z = Math.abs(startYear - artwork.dating.begin) * (new THREE.Vector3(1, 0, 0).length() * 40);
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