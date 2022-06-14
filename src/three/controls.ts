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
    private readonly camera;
    private readonly minY: number;
    
    private _vector = new THREE.Vector3();
    private _moveUp = false;
    private _moveDown = false;
    private _moveForward = false;
    private _moveBackward = false;
    private _moveLeft = false;
    private _moveRight = false;
    // @ts-ignore
    private _flyMode = false; // TODO

    constructor(camera: THREE.PerspectiveCamera, element: HTMLElement, minY: number) {
        super(camera, element);
        this.camera = camera;
        this.minY = minY;

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
    
            // TODO: Introduce a flight mode instead of doing trivial up/down movement
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= this.velocity.y * 10.0 * delta;
    
            this.direction.z = Number(this._moveForward) - Number(this._moveBackward);
            this.direction.x = Number(this._moveRight) - Number(this._moveLeft);
            this.direction.y = Number(this._moveUp) - Number(this._moveDown);

            this.direction.normalize();
    
            if (this._moveForward || this._moveBackward) this.velocity.z -= this.direction.z * Math.pow(controlProperties.movementSpeed, 2) * delta;
            if (this._moveLeft || this._moveRight) this.velocity.x -= this.direction.x * Math.pow(controlProperties.movementSpeed, 2) * delta;
            // We use hardcoded movement speed to maintain controlability
            if (this._moveUp || this._moveDown) this.velocity.y -= this.direction.y * 800 * delta;
    
            this.moveRight(-this.velocity.x * delta);
            this.moveForward(-this.velocity.z * delta);
            this.moveUp(-this.velocity.y * delta);

            if (this.getObject().position.y < this.minY) {
                this.velocity.y = 0;
                this.getObject().position.y = this.minY;
            }
        }
    }

    moveUp(distance: number) {
        this._vector.setFromMatrixColumn(this.camera.matrix, 0);
        this._vector.crossVectors(this.camera.up , this._vector );
        this.camera.position.addScaledVector(this.camera.up, distance);
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
            case 'Space':
                this._moveUp = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this._moveDown = true;
                break;
        }
    
    }
    
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
            case 'Space':
                this._moveUp = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this._moveDown = false;
                break;
        }
    }
}