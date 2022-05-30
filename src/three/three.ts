import * as THREE from "three";
import { Material, Mesh, MeshBasicMaterial, Object3D, Raycaster, Vector3 } from "three";
import { DimensionizedCdaItem, ItemDimensions } from "../types";
import { animateControls, controlProperties, createControls } from "./controls";
import { calcSurfaceArea, getWebGLErrorMessage, isWebGL2Available, makeTextSprite } from "./utils";
import { Pane } from 'tweakpane';

// TODO: Proper typing
type ArtworkUserData = { 
    year: number,
    rawItem: DimensionizedCdaItem 
};
type ArtworkObject = Mesh & { userData: ArtworkUserData };

// Very trivial type guard, but sufficient
const isArtworkObject = (object: Object3D) : object is ArtworkObject => {
    return (typeof object.userData.year === "number");
}

if(!isWebGL2Available()) {
    document.body.appendChild(getWebGLErrorMessage());
    throw new Error("WebGL is not supported");
}

const renderer = new THREE.WebGLRenderer({ antialias: true });

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const scene = new THREE.Scene();

// Add Floor
const floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
const floorMaterial = new THREE.MeshBasicMaterial( { 
    color: 0x565656
} );
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

const raycaster = new THREE.Raycaster();

const pane = new Pane();
const PROPS = {
    highlightColor: 0x8cff32
};

// object where artworks added to the scene will be saved with their dating as key.
//const artworkObjects: Record<number, Object3D[]> = {};

scene.add(new THREE.AxesHelper(100));

const toStart = () => {
    camera.position.set(-10, 10, -10);
    camera.rotation.set(0, 180 * Math.PI / 180, 0); // Turn aroundas
};

const initPane = () => {
    const resetBtn = pane.addButton({
        title: "Back to start"
    });
    resetBtn.on("click", toStart);

    pane.addInput(PROPS, "highlightColor", {
        view: 'color'
    });

    pane.addInput(controlProperties, "movementSpeed", {
        view: "number",
        min: 0,
        max: 100
    });
};

const initScene = () => {

    toStart();

    camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
    
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    scene.background = new THREE.Color( 0x878787 );
	scene.fog = new THREE.Fog( 0x878787, 0, 750 );

    floor.rotateX(-Math.PI / 2);
    scene.add(floor);

    // Crosshair
    const cursorSize = 0.75;
    const cursorThickness = 1.15;
    const cameraMin = 0.1;
    const cursorGeometry = new THREE.RingBufferGeometry(
      cursorSize * cameraMin,
      cursorSize * cameraMin * cursorThickness,
      32,
      0,
      Math.PI * 0.5,
      Math.PI * 2
    );
    const cursorMaterial = new THREE.MeshBasicMaterial({ color: "white" });
    const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
    cursor.position.z = -cameraMin * 50;
    camera.add(cursor);

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

let highlightedArtworks: ArtworkObject[] = [];

const highlightArtwork = (artwork: ArtworkObject) => {
    console.log(artwork);
    // TODO: type this
    if(artwork.material instanceof MeshBasicMaterial) {
        artwork.material.color.set(PROPS.highlightColor);
    }
    highlightedArtworks.push(artwork);
    const highlightEvent = new CustomEvent("highlight", { detail: artwork.userData.rawItem })
    document.dispatchEvent(highlightEvent);
};

const unhighlightArtwork = (artwork: ArtworkObject) => {
    // TODO: type this
    if(artwork.material instanceof MeshBasicMaterial) {
        artwork.material.color.set(0xffffff);
    }
    highlightedArtworks.splice(highlightedArtworks.indexOf(artwork));
    const highlightEvent = new CustomEvent("unhighlight", { detail: artwork.userData.rawItem })
    document.dispatchEvent(highlightEvent);
};

const isHighlighted = (artwork: ArtworkObject) => highlightedArtworks.some(aw => aw === artwork);

const highlightIntersectedArtworks = (rc: Raycaster) => {
    const intersects = rc.intersectObjects( scene.children );
    const artworkIntersections = intersects.filter(i => isArtworkObject(i.object));
    const isIntersected = (artwork: ArtworkObject) => artworkIntersections.some(intersection => intersection.object === artwork && intersection.distance < 100);
    for(const artworkIntersection of artworkIntersections) {
        const object = artworkIntersection.object as ArtworkObject;
        
        if(!isHighlighted(object) && isIntersected(object)) {
            highlightArtwork(object);
        }
    }

    // Unhighlight all "pending" - artworks not currently intersected, but highlighted
    const pendingHighlights = highlightedArtworks
        .filter(aw => !isIntersected(aw))
        .filter(aw => isHighlighted(aw));
    for(const pendingHighlight of pendingHighlights) {
        unhighlightArtwork(pendingHighlight);
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

const createGeometry = (dimensions: ItemDimensions): THREE.BufferGeometry => {
    switch(dimensions.shape) {
        case "circle":
            return new THREE.CircleGeometry(dimensions.dimension.diameter / 2, 32);
        case "rectangle":
            return new THREE.BoxGeometry(dimensions.dimension.width, dimensions.dimension.height, dimensions.dimension.depth);
    }
};

const createArtworkMesh = async (artwork: DimensionizedCdaItem): Promise<ArtworkObject> => {
    const geometry = createGeometry(artwork.dimensions);
    const url = artwork.images.overall.images[0].sizes.medium.src.replaceAll("imageserver-2022", "data-proxy/image.php?subpath=");
    const texture = await new THREE.TextureLoader().loadAsync(url);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        map: texture
    });
    const mesh = new THREE.Mesh(geometry, material);

    const year = artwork.dating.begin;
    const userData: ArtworkUserData = {
        year,
        rawItem: artwork
    } as ArtworkUserData;
    mesh.userData = userData;

    return mesh as any as ArtworkObject;
};

const createArtworkObjects = (artworks: DimensionizedCdaItem[]): Promise<ArtworkObject[]> => Promise.all(artworks.map(art => createArtworkMesh(art)));

const groupArtworkObjectsByDating = (objects: ArtworkObject[]): Record<number, ArtworkObject[]> => objects.reduce((acc, curr) => {
    const year = (curr.userData as ArtworkUserData).year;
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

    initPane();

    const controls = createControls(camera, renderer.domElement);
    scene.add(controls.getObject());

    animate();

    return renderer.domElement;
};