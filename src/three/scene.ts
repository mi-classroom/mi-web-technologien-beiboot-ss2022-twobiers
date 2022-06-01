import * as THREE from "three";
import { Scene } from "three";
import { createControls } from "./controls";
import { Crosshair } from "./objects/crosshair";

const near = 0.1;



export class CranachScene extends Scene {
    public readonly camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, near, 1000);
    public readonly renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    private readonly clock = new THREE.Clock();
    private readonly controls = createControls(this.camera, this.renderer.domElement);
    public floor: THREE.Mesh;

    constructor() {
        super();

        // Renderer
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", this.onWindowResize);

        // Camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.camera.add(new Crosshair());
        this.resetCamera();

        // Controls
        this.add(this.controls.getObject());

        // Misc
        this.background = new THREE.Color( 0x878787 );
        this.fog = new THREE.Fog( 0x878787, 0, 750 );

        // Floor
        const floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
        const floorMaterial = new THREE.MeshBasicMaterial( { 
            color: 0x565656
        } );
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.position.setY(-0.1);
        this.floor.rotateX(-Math.PI / 2);
        this.add(this.floor);

        // Helpers
        const gridHelper = new THREE.GridHelper(10000, 1000, 0x0000ff, 0x808080);

        gridHelper.position.setY(0);
        this.add(gridHelper);
        
        const axesHelper = new THREE.AxesHelper(100);
        axesHelper.position.setY(0.05);
        this.add(axesHelper);
        
    }

    resetCamera() {
        this.camera.position.set(10, 1.70 / near, -10); // We assume a person with about 1,75m body size. 5cm difference for eye height. Still needs to be aligned with camera field
        this.camera.rotation.set(0, 180 * Math.PI / 180, 0); // Turn around
    }

    update() {
        const elapsedTime = this.clock.getElapsedTime();

        this.floor.position.set(this.camera.position.x, this.floor.position.y, this.camera.position.z);
        this.renderer.render(this, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.update();
    }

}