import * as THREE from "three";

const _scene = new THREE.Scene();
const floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
const floorMaterial = new THREE.MeshBasicMaterial( { 
    color: 0x565656
} );
const _floor = new THREE.Mesh(floorGeometry, floorMaterial);

_scene.background = new THREE.Color( 0x878787 );
_scene.fog = new THREE.Fog( 0x878787, 0, 750 );
_scene.add(new THREE.AxesHelper(100));


_floor.rotateX(-Math.PI / 2);
_scene.add(_floor);

export const scene = _scene;
export const floor = _floor;