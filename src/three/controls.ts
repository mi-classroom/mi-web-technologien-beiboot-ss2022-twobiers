import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let controls: PointerLockControls; 

const clock = new THREE.Clock(true);

type ControlProperties = {
    movementSpeed: number;
    zoomAmount: number;
}

const onKeyDown = (event: KeyboardEvent)  => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }

};

const onKeyUp = (event: KeyboardEvent)  => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
};

export let controlProperties: ControlProperties = {
    movementSpeed: 20.0,
    zoomAmount: 35
};

export const animateControls = () => {
    if(controls.isLocked) {
        const delta = clock.getDelta();

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * Math.pow(controlProperties.movementSpeed, 2) * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * Math.pow(controlProperties.movementSpeed, 2) * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
    }
}

export const createControls = (camera: THREE.PerspectiveCamera, element: HTMLElement): PointerLockControls => {
    controls = new PointerLockControls(camera, element);

    element.addEventListener("click", (event: MouseEvent) => {
        // Left click 
        if(event.button === 0) {
            if(!controls.isLocked) {
                controls.lock()
            }
        }
    }, false);

    element.addEventListener("pointerdown", (event) => {
        // Right click
        if(event.button === 2) {
            camera.fov -= controlProperties.zoomAmount;
            camera.updateProjectionMatrix();
        }
    });

    element.addEventListener("pointerup", (event) => {
        // Right click
        if(event.button === 2) {
            camera.fov += controlProperties.zoomAmount;
            camera.updateProjectionMatrix();
        }
    });


    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    return controls;
};