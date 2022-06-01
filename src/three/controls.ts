import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

type ControlProperties = {
    movementSpeed: number;
    zoomAmount: number;
}

export const controlProperties: ControlProperties = {
    movementSpeed: 20.0,
    zoomAmount: 35
};

export class CranachControls extends PointerLockControls {
    private readonly velocity = new THREE.Vector3();
    private readonly direction = new THREE.Vector3();
    private readonly clock = new THREE.Clock();
    
    private _moveForward = false;
    private _moveBackward = false;
    private _moveLeft = false;
    private _moveRight = false;

    constructor(camera: THREE.PerspectiveCamera, element: HTMLElement) {
        super(camera, element);

        element.addEventListener("click", (event: MouseEvent) => {
            // Left click 
            if(event.button === 0) {
                if(!this.isLocked) {
                    this.lock();
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
    
    
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    public animate() {
        if(this.isLocked) {
            const delta = this.clock.getDelta();
    
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
    
            this.direction.z = Number(this._moveForward) - Number(this._moveBackward);
            this.direction.x = Number(this._moveRight) - Number(this._moveLeft);
            this.direction.normalize();
    
            if (this._moveForward || this._moveBackward) this.velocity.z -= this.direction.z * Math.pow(controlProperties.movementSpeed, 2) * delta;
            if (this._moveLeft || this._moveRight) this.velocity.x -= this.direction.x * Math.pow(controlProperties.movementSpeed, 2) * delta;
    
            this.moveRight(-this.velocity.x * delta);
            this.moveForward(-this.velocity.z * delta);
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this._moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this._moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this._moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this._moveRight = true;
                break;
        }
    
    };
    
    private onKeyUp(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this._moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this._moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this._moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this._moveRight = false;
                break;
        }
    };
}