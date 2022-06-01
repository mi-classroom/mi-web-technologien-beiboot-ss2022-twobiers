import * as THREE from "three";
import { Scene } from "three";
import { DimensionizedCdaItem } from "../types";
import { animateControls, createControls } from "./controls";
import { Artwork3DObject } from "./objects/artwork";
import { ArtworkGroup } from "./objects/artworkGroup";
import { Crosshair } from "./objects/crosshair";

const near = 0.1;



const createArtworkObjects = (artworks: DimensionizedCdaItem[]) => Promise.all(artworks.map(art => Artwork3DObject.buildArtworkObject(art)));

const groupArtworkObjectsByDating = (objects: Artwork3DObject[], preserveGaps?: boolean) => {
    const grouped = objects.reduce<Record<number, Artwork3DObject[]>>((acc, curr) => {
        const year = curr.userData.year;
        if(!acc[year]) {
            acc[year] = []
        }
        acc[year].push(curr);
        return acc;
    }, {});

    if(!preserveGaps) {
        return grouped;
    }

    // Could have been done in the reduce method, but this would assume ordering.
    // We are ordering the artworks beforehand, but we cannot assume that within
    // this function. We could sort the objects before but this would be pointless
    // if we're not preserving the gaps.
    // This approach should (hopefully) be the best option in terms of reliablity, 
    // maintainability and clarity. 
    const years = Object.keys(grouped).map(year => Number(year));
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    for(let i = minYear; i < maxYear; ++i) {
        if(!grouped[i]) {
            grouped[i] = [];
        }
    }

    return grouped;
}

export class CranachScene extends Scene {
    public readonly camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, near, 1000);
    public readonly renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    public readonly floor: THREE.Mesh;
    private readonly clock = new THREE.Clock();
    private readonly controls = createControls(this.camera, this.renderer.domElement);
    private readonly raycaster = new THREE.Raycaster();
    
    private _artworkObjects: Artwork3DObject[] = [];
    private _artworkIntersections: THREE.Intersection<Artwork3DObject>[] = [];
    

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

        animateControls();

        this.raycaster.setFromCamera(new THREE.Vector2(), this.camera);
        this.highlightIntersectedArtworks();

        // Update floor to camera positon, so that it makes an illusion of infinite floor
        this.floor.position.set(this.camera.position.x, this.floor.position.y, this.camera.position.z);
        
        this.renderer.render(this, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.update();
    }

    async setArtworks(artworks: DimensionizedCdaItem[]) {
        // We sort the array by the dating to maintain consistency
        artworks = artworks.sort((a, b) => a.dating.begin - b.dating.begin);

        // First, we create all meshes from the artworks
        this._artworkObjects = await createArtworkObjects(artworks);

        // Next, we group them by their particular dating
        const groups = groupArtworkObjectsByDating(this._artworkObjects, true);

        // We create modeled groups
        const modeledGroups = Object.entries(groups).map(([year, arr]) => new ArtworkGroup(Number(year), arr));

        let currentOffset = 0;
        const groupBox = new THREE.Box3();
        const groupBoxSize = new THREE.Vector3();
        for(const element of modeledGroups) {
            const group = element;
            groupBox.setFromObject(group);
            groupBox.getSize(groupBoxSize);

            group.position.setZ(currentOffset);
            // group.position.set(0, group.position.y, currentOffset);
            group.rotation.set(0, 180 * Math.PI / 180, 0); // Flip the group to right align it on the z-axis. Not really smart but pragmatic

            currentOffset += groupBoxSize.z + 20;

            const helper = new THREE.BoxHelper(group, 0xff0000);
            helper.update();
            this.add(helper);
            this.add(group);
        }
    }

    private highlightIntersectedArtworks() {
        this._artworkIntersections.length = 0;
        const nearest = this.raycaster.intersectObjects<Artwork3DObject>(this._artworkObjects, false, this._artworkIntersections)
            .find(intersection => intersection.distance < 100);
        
        // Only highlight first
        if (nearest) {
            nearest.object.highlight();
        }
    
        // Unhighlight all "pending" - artworks not currently intersected, but highlighted
        const pendingHightlights = this._artworkObjects.filter(aw => aw.isHighlighted && nearest?.object?.id !== aw.id);
        for(const pending of pendingHightlights) {
            pending.unhighlight();
        }
    }

}