import * as THREE from "three";
import { BufferGeometry, CylinderGeometry, LineCurve3, Mesh, MeshBasicMaterial, Object3D, TubeGeometry, Vector3 } from "three";
import { DimensionizedCdaItem, ItemDimensions } from "../../types";
import { dataProxyUrl } from "../utils";

type ArtworkUserData = { 
    year: number,
    rawItem: DimensionizedCdaItem 
};

export interface SelectionEvent extends CustomEvent {
    detail: Artwork3DObject
}

// Very trivial type guard, but sufficient
export const isArtworkObject = (object: Object3D) : object is Artwork3DObject => {
    return (object.name === "artwork");
}

export const artworkProperties = {
    enableVisualHighlight: false,
    highlightColor: 0x8cff32,
    scale: 0.1 // We assume that 1 unit is 1m
};

const createGeometry = (dimensions: ItemDimensions): THREE.BufferGeometry => {
    switch(dimensions.shape) {
        case "circle":
            return new THREE.CircleGeometry(dimensions.dimension.diameter / 2, 32);
        case "rectangle":
            return new THREE.BoxGeometry(dimensions.dimension.width, dimensions.dimension.height, dimensions.dimension.depth || 1);
    }
};

export class Artwork3DObject extends Mesh {
    public isHighlighted: boolean = false;    
    public isSelected: boolean = false;    
    public isHolyHighlighted: boolean = false;    
    private _artworkRef: DimensionizedCdaItem;
    public userData: ArtworkUserData;
    public readonly name = "artwork";
    // private _cachedSize: THREE.Vector3 | null = null;

    private constructor (geometry: BufferGeometry, material: MeshBasicMaterial, artwork: DimensionizedCdaItem) {
        super(geometry, material);
        this._artworkRef = artwork;
        this.userData = {
            year: artwork.dating.begin,
            rawItem: artwork
        }
        this.scale.set(artworkProperties.scale, artworkProperties.scale, artworkProperties.scale);
        this.geometry.computeBoundingBox();
    }

    static async buildArtworkObject(artwork: DimensionizedCdaItem): Promise<Artwork3DObject> {
        const geometry = createGeometry(artwork.parsedDimensions);
        const url = dataProxyUrl(artwork.images.overall.images[0].sizes.medium.src);
        const texture = await new THREE.TextureLoader().loadAsync(url);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            map: texture
        });
        return new this(geometry, material, artwork);
    }

    // TODO: I really don't know why this calculation fails. It will result in 1/2 
    //       the actual object size. I guess its some weird Shenannigan with mutable data structure
    //       and getter methods. Leaving it for now as it is as I need to focus on other things.
    // get size(): THREE.Vector3 {
    //     if(this._cachedSize !== null) {
    //         return this._cachedSize;
    //     }
    //     if(this.geometry.boundingBox === null) {
    //         this.geometry.computeBoundingBox();
    //     }
    //     const box = this.geometry.boundingBox!;
    //     this._cachedSize = box.max.sub(box.min).multiply(this.scale).multiplyScalar(0.1);
    //     return this._cachedSize;
    // }

    get width(): number {
        if(this.geometry.boundingBox === null) {
            this.geometry.computeBoundingBox();
        }
        const box = this.geometry.boundingBox!;
        return (box.max.x - box.min.x) * this.scale.x * 0.1;
        // return this.size.x;
    }

    get height(): number {
        if(this.geometry.boundingBox === null) {
            this.geometry.computeBoundingBox();
        }
        const box = this.geometry.boundingBox!;
        return (box.max.y - box.min.y) * this.scale.y * 0.1;
        // return this.size.y;
    }

    get depth(): number {
        if(this.geometry.boundingBox === null) {
            this.geometry.computeBoundingBox();
        }
        const box = this.geometry.boundingBox!;
        return (box.max.z - box.min.z) * this.scale.z * 0.1;
        // return this.size.z;
    }

    highlightHoly(): void {
        if(this.isHolyHighlighted) {
            return;
        }
        if(this.geometry.boundingSphere === null) {
            this.geometry.computeBoundingSphere();
        }
        const sphere = this.geometry.boundingSphere!;

        const geometry = new CylinderGeometry(sphere.radius + 20, sphere.radius + 20, 1000, 64, 64, true);
        const material = new MeshBasicMaterial({ 
            color: 0xffdd00,
            transparent: true,
            opacity: 0.2
        });
        const holyMesh = new THREE.Mesh(geometry, material);
        holyMesh.name = "holy-mesh";

        this.add(holyMesh);
        this.isHolyHighlighted = true;
    }

    unhighlightHoly(): void {
        if(!this.isHolyHighlighted) {
            return;
        }
        for(const holyChild of this.children.filter(c => c.name === "holy-mesh")) {
            this.remove(holyChild);
            this.isHolyHighlighted = false;
        }
    }

    select(): void {
        if(this.isSelected) {
            return;
        }
        this.isSelected = true;
        this.highlightHoly();
        const selectEvent = new CustomEvent("select", { detail: this }) as SelectionEvent;
        document.dispatchEvent(selectEvent);
    }

    unselect(): void {
        if(!this.isSelected) {
            return;
        }
        this.isSelected = false;
        this.unhighlightHoly();
        const unselect = new CustomEvent("unselect", { detail: this }) as SelectionEvent;
        document.dispatchEvent(unselect);
    }

    highlight(): void {
        if(artworkProperties.enableVisualHighlight) {
            if(this.material instanceof MeshBasicMaterial) {
                this.material.color.set(artworkProperties.highlightColor);
            }
        }
        this.isHighlighted = true;
        const highlightEvent = new CustomEvent("highlight", { detail: this._artworkRef });
        document.dispatchEvent(highlightEvent);
    }

    unhighlight(): void {
        // We should still be able to unhighlight an artwork in case we are in a pending state.

        if(this.material instanceof MeshBasicMaterial) {
            this.material.color.set(0xffffff);
        }
        const highlightEvent = new CustomEvent("unhighlight", { detail: this._artworkRef })
        document.dispatchEvent(highlightEvent);
    }
}