import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const renderer = new THREE.WebGLRenderer( { antialias: true } );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(100));

const getCube = (): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
    });
    const cube = new THREE.Mesh(geometry, material);
    return cube;
};

const initScene = () => {
    camera.position.z = 2;

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents( window );

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
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

export const getSceneCanvas = (): HTMLCanvasElement => {
    initScene();
    const cube = getCube();
    scene.add(cube);

    animate();

    return renderer.domElement;
};