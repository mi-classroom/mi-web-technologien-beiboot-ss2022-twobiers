import * as THREE from "three";
import { animateControls, initControls } from "./controls";
import { makeTextSprite } from "./utils";

const renderer = new THREE.WebGLRenderer( { antialias: true } );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper(100));

const initScene = () => {
    camera.position.set(-10, 10, -10);
    camera.rotation.set(0, 180 * Math.PI / 180, 0); // Turn aroundas

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

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

export const createTimeline = (startYear: number, endYear: number) => {
    const yearDiff = endYear - startYear;
    if(yearDiff <= 0) {
        throw new Error("Invalid years provided, difference must be greater than 0");
    }

    const dir = new THREE.Vector3(0, 0, 1); // direction alignment on z-axis
    const origin = new THREE.Vector3(0, 1, 0); // Preserve Axes helper, therefore move one level up
    const lengthOfYear = 10;

    for(let year = startYear; year <= endYear; ++year) {
        const startLabel = makeTextSprite(`${year}`);
        const offsetZ = origin.z + Math.abs(startYear - year) * lengthOfYear;
        startLabel.position.set(origin.x, 10, offsetZ);
        scene.add(startLabel);
    }

    const length = yearDiff * lengthOfYear;
    const color = 0xffff00;
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, color, 1, 1);

    scene.add(arrowHelper);
};

export const getSceneCanvas = (): HTMLCanvasElement => {
    initScene();
    const controls = initControls(camera, renderer.domElement);
    scene.add(controls.getObject());

    animate();

    return renderer.domElement;
};