import * as THREE from "three";

const cursorSize = 0.2;
const cursorThickness = 1.15;
const cameraMin = 0.1;
const cursorGeometry = new THREE.RingBufferGeometry(
    cursorSize * cameraMin,
    cursorSize * cameraMin * cursorThickness,
    32,
    0,
    Math.PI * 0.5,
    Math.PI * 2);
const cursorMaterial = new THREE.MeshBasicMaterial({ color: "white" });
const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
cursor.position.z = -cameraMin * 50;

export const crosshair = cursor;