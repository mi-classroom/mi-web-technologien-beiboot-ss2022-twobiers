import * as THREE from "three";
import { BufferGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";
import { DimensionizedCdaItem, ItemDimensions } from "../../types";
import { dataProxyUrl } from "../utils";

type ArtworkUserData = { 
    year: number,
    rawItem: DimensionizedCdaItem 
};

// Very trivial type guard, but sufficient
export const isArtworkObject = (object: Object3D) : object is Artwork3DObject => {
    return (object.name === "artwork");
}

export const artworkProperties = {
    enableVisualHighlight: true,
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
    private _artworkRef: DimensionizedCdaItem;
    public userData: ArtworkUserData;
    public readonly name = "artwork";
    private _cachedSize: THREE.Vector3 | null = null;

    private constructor (geometry: BufferGeometry, material: MeshBasicMaterial, artwork: DimensionizedCdaItem) {
        super(geometry, material);
        this._artworkRef = artwork;
        this.userData = {
            year: artwork.dating.begin,
            rawItem: artwork
        }
    }

    static async buildArtworkObject(artwork: DimensionizedCdaItem): Promise<Artwork3DObject> {
        const geometry = createGeometry(artwork.parsedDimensions);
        const url = dataProxyUrl(artwork.images.overall.images[0].sizes.medium.src);
        const texture = await new THREE.TextureLoader().loadAsync(url);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            map: texture
        });
        const mesh = new this(geometry, material, artwork);
        mesh.scale.set(artworkProperties.scale, artworkProperties.scale, artworkProperties.scale);
        mesh.geometry.computeBoundingBox();
        return mesh;
    }

    get size(): THREE.Vector3 {
        if(this._cachedSize !== null) {
            return this._cachedSize;
        }
        if(this.geometry.boundingBox === null) {
            this.geometry.computeBoundingBox();
        }
        const box = this.geometry.boundingBox!;
        this._cachedSize = box.max.sub(box.min).multiply(this.scale).multiplyScalar(0.1);
        return this._cachedSize;
    }

    get width(): number {
        return this.size.x;
    }

    get height(): number {
        return this.size.y;
    }

    get depth(): number {
        return this.size.z;
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