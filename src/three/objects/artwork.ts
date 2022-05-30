import * as THREE from "three";
import { BufferGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";
import { DimensionizedCdaItem, ItemDimensions } from "../../types";

// TODO: Proper typing
type ArtworkUserData = { 
    year: number,
    rawItem: DimensionizedCdaItem 
};

export type ArtworkObject = Mesh & { 
    userData: ArtworkUserData;
    isHighlighted: boolean;
    highlight(): void;
    unhighlight(): void;
};

// Very trivial type guard, but sufficient
export const isArtworkObject = (object: Object3D) : object is ArtworkObject => {
    return (object.name === "artwork");
}

export const artworkProperties = {
    highlightColor: 0x8cff32,
    scale: 0.1 // We assume that 1 unit is 1m
};

const createGeometry = (dimensions: ItemDimensions): THREE.BufferGeometry => {
    switch(dimensions.shape) {
        case "circle":
            return new THREE.CircleGeometry(dimensions.dimension.diameter / 2, 32);
        case "rectangle":
            return new THREE.BoxGeometry(dimensions.dimension.width, dimensions.dimension.height, dimensions.dimension.depth);
    }
};

export class Artwork3DObject extends Mesh {
    public isHighlighted: boolean = false;    
    private _artworkRef: DimensionizedCdaItem;
    public userData: ArtworkUserData;
    public readonly name = "artwork";

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
        const url = artwork.images.overall.images[0].sizes.medium.src.replaceAll("imageserver-2022", "data-proxy/image.php?subpath=");
        const texture = await new THREE.TextureLoader().loadAsync(url);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            map: texture
        });
        const mesh = new this(geometry, material, artwork);
        mesh.scale.set(artworkProperties.scale, artworkProperties.scale, artworkProperties.scale);
        return mesh;
    }

    highlight(): void {
        if(this.material instanceof MeshBasicMaterial) {
            this.material.color.set(artworkProperties.highlightColor);
        }
        this.isHighlighted = true;
        const highlightEvent = new CustomEvent("highlight", { detail: this._artworkRef });
        document.dispatchEvent(highlightEvent);
    }

    unhighlight(): void {
        if(this.material instanceof MeshBasicMaterial) {
            this.material.color.set(0xffffff);
        }
        const highlightEvent = new CustomEvent("unhighlight", { detail: this._artworkRef })
        document.dispatchEvent(highlightEvent);
    }
}