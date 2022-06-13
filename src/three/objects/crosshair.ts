import * as THREE from "three";
import { Mesh } from "three";


const cursorSize = 0.2;
const cursorThickness = 1.15;
const cameraMin = 0.1;

export class Crosshair extends Mesh {
    constructor() {
        const cursorGeometry = new THREE.RingBufferGeometry(
            cursorSize * cameraMin,
            cursorSize * cameraMin * cursorThickness,
            32,
            0,
            Math.PI * 0.5,
            Math.PI * 2);
        const cursorMaterial = new THREE.MeshBasicMaterial({ color: "white" });
        
        super(cursorGeometry, cursorMaterial);
        
        this.position.z = -cameraMin * 50;
    }
};