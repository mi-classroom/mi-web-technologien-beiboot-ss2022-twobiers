import * as THREE from "three";
import { createControls } from "../controls";
import { crosshair } from "./crosshair";

const near = 0.1;

export const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance"
});
export const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, near, 1000);

export const scene = new THREE.Scene();

const floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
const floorMaterial = new THREE.MeshBasicMaterial( { 
    color: 0x565656
} );

export const floor = new THREE.Mesh(floorGeometry, floorMaterial);

scene.background = new THREE.Color( 0x878787 );
scene.fog = new THREE.Fog( 0x878787, 0, 750 );
scene.add(new THREE.AxesHelper(100));


floor.rotateX(-Math.PI / 2);
scene.add(floor);

export const resetCamera = () => {
    camera.position.set(10, 1.70 / near, -10); // We assume a person with about 1,75m body size. 5cm difference for eye height. Still needs to be aligned with camera field
    camera.rotation.set(0, 180 * Math.PI / 180, 0); // Turn around
};

resetCamera();

camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
    
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

// Crosshair
camera.add(crosshair);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}, false);


const render = () => {
    renderer.render(scene, camera);
};

const controls = createControls(camera, renderer.domElement);
scene.add(controls.getObject());