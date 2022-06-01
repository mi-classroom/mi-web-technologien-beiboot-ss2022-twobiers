import { Group, Object3D } from "three";
import { makeTextSprite } from "../utils";
import { Artwork3DObject } from "./artwork";

const gap = 10;
const eyeHeight = 1.7;
const elevate = 1;

// Very trivial type guard, but sufficient
export const isArtworkGroup = (object: Object3D) : object is ArtworkGroup => {
    return (object.name === "artworkGroup");
}

export class ArtworkGroup extends Group {
    public readonly name = "artworkGroup";
    public readonly artworkObjects: ReadonlyArray<Artwork3DObject>;

    constructor(year: number, objects: Artwork3DObject[]) {
        super();

        let offsetX = 0;
        let offsetZ = 0;
        // Artworks will be placed NEXT to each other. 
        for(const element of objects) {        
            // We want to assure, that each artwork has a deterministic location on the y axis
            // at a multiple of 10. This would give us a bit of consistency although it is not really necessary.
            // Because we don't want artworks really close to each other, we take 1/4 as a limit for padding.
            // 1/4 => width / 2 > 0.25 <=> width > 0.5
            let padding = gap;
            if (element.width > 0.5) {
                padding = gap * Math.round(element.width)
            }

            const x = offsetX + padding;
            // Place every artwork centered on eye height, but if it's to large we just pad from the bottom and leave it as it is
            const y = (element.height / 2) > eyeHeight ? (element.height / 2) * 10 + elevate : eyeHeight * 10;
            const z = 0.01 + offsetZ; // We increates z each time a bit to prevent flickering. 
            element.position.set(x, y , z);

            this.add(element);
            offsetX = x + padding;
            offsetZ = z; 
        }
        // Place a year indicator on top
        const label = makeTextSprite(`${year}`, { fontsize: 50 });
        label.position.set(0, 20, 0);
        this.add(label);
        this.artworkObjects = objects;
    }
};