import * as THREE from "three";
import { Intersection, Scene } from "three";
import { DimensionizedCdaItem } from "../types";
import { CranachControls } from "./controls";
import { Artwork3DObject } from "./objects/artwork";
import { ArtworkConnection } from "./objects/artworkConnection";
import { ArtworkGroup } from "./objects/artworkGroup";
import { Crosshair } from "./objects/crosshair";

const near = 0.1;

type SceneProperties = {
    enableHelpers: boolean;
}

type Helper = THREE.GridHelper | THREE.AxesHelper | THREE.BoxHelper;

export const sceneProperties: SceneProperties = {
    enableHelpers: true
};

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
    public readonly camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, 1000);
    public readonly renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    public readonly eyeheight = 1.70 / near;
    public readonly floor: THREE.Mesh;
    private readonly clock = new THREE.Clock();
    private readonly controls = new CranachControls(this.camera, this.renderer.domElement, this.eyeheight);
    private readonly raycaster = new THREE.Raycaster();
    private readonly coords = new THREE.Vector2();
    
    private _artworkObjects: Artwork3DObject[] = [];
    private _artworkIntersections: THREE.Intersection<Artwork3DObject>[] = [];
    
    private _helpers: Helper[] = [];
    

    constructor() {
        super();

        // Renderer
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", () => this.onWindowResize());
        this.renderer.domElement.addEventListener("click", () => this.selectNearestIntersectedArtwork());

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
        this._helpers.push(gridHelper);
        
        const axesHelper = new THREE.AxesHelper(100);
        axesHelper.position.setY(0.05);
        this._helpers.push(axesHelper);
        
        this.toggleHelpers(sceneProperties.enableHelpers);
    }

    toggleHelpers(active: boolean) {
        if(active) {
            this.add(...this._helpers);
        } else {
            this.remove(...this._helpers);
        }
    }

    private addHelper(helper: Helper) {
        this._helpers.push(helper);
        if(sceneProperties.enableHelpers) {
            this.add(helper);
        }
    }

    resetCamera() {
        this.camera.position.set(10, this.eyeheight, -10); // We assume a person with about 1,75m body size. 5cm difference for eye height. Still needs to be aligned with camera field
        this.camera.rotation.set(0, 180 * Math.PI / 180, 0); // Turn around
    }

    update() {
        // @ts-ignore
        const delta = this.clock.getDelta();

        this.controls.animate();

        this.raycaster.setFromCamera(this.coords, this.camera);
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
            this.addHelper(helper);

            for(const artwork of element.artworkObjects) {
                const artworkHelper = new THREE.BoxHelper(artwork, 0xFFFF00);
                artworkHelper.update();
                this.addHelper(artworkHelper);
            }
            
            this.add(group);
        }

        // TODO: For the moment we will render also the relation connections for development purposes.
        // remove when ready.
        for(const artwork of this._artworkObjects) {
            const relatedArtworks = this.findRelatedArtworks(artwork);
            if(relatedArtworks.length > 0) {
                const connections = relatedArtworks.map(related => new ArtworkConnection(artwork, related));
                this.add(...connections);
            }
        }
    }

    private findNearestIntersectedArtwork(): Intersection<Artwork3DObject> | undefined {
        this._artworkIntersections.length = 0;
        return this.raycaster.intersectObjects<Artwork3DObject>(this._artworkObjects, false, this._artworkIntersections)
            .find(intersection => intersection.distance < 20);
    }

    private findRelatedArtworks(artwork: Artwork3DObject): Artwork3DObject[] {
        const references = artwork.userData.rawItem.references;
        if(references === undefined || references?.length === 0) {
            return [];
        }
        return this._artworkObjects.filter(o => references.some(ref => ref.inventoryNumber === o.userData.rawItem.inventoryNumber));
    }

    private selectNearestIntersectedArtwork() {
        const nearest = this.findNearestIntersectedArtwork();
        
        // Lets just (un)select if we do really have a intersection available 
        if (nearest && !nearest.object.isSelected) {
            const alreadySelected = this._artworkObjects.filter(aw => aw.isSelected);
            for(const selected of alreadySelected) {
                selected.unselect();
            }

            const nearestObject = nearest.object;
            nearestObject.select();
            const relatedArtworks = this.findRelatedArtworks(nearestObject);
            if(relatedArtworks.length > 0) {
                const connections = relatedArtworks.map(related => new ArtworkConnection(nearestObject, related));
                this.add(...connections);
            }
        }
    }

    private highlightIntersectedArtworks() {
        this._artworkIntersections.length = 0;
        const nearest = this.findNearestIntersectedArtwork();
        
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