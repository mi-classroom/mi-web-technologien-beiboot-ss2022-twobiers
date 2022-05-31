import * as THREE from "three";
import { makeTextSprite } from "../utils";
import { Artwork3DObject } from "./artwork";

const gap = 10;

export const createArtworkModelGroupOfYear = (year: number, objects: Artwork3DObject[]): THREE.Group => {
    const group = new THREE.Group();
    let offsetX = 0;
    let offsetZ = 0;
    // Artworks will be placed NEXT to each other. 
    for(const element of objects) {
        // TODO: maybe create methods within the object
        if(element.geometry.boundingBox === null) {
            element.geometry.computeBoundingBox();
        }
        const artworkBox = element.geometry.boundingBox!;
        
        // We want to assure, that each artwork has a deterministic location on the y axis
        // at a multiple of 10. This would give us a bit of consistency although it is not really necessary.
        // Because we don't want artworks really close to each other, we take 1/4 as a limit for padding.
        // 1/4 => width / 2 > 0.25 <=> width > 0.5
        let padding = gap;
        if (element.width > 0.5) {
            padding = gap * Math.round(element.width)
        }

        const x = offsetX + padding;
        const y =  (0 - artworkBox.min.y) * element.scale.y; // On the ground...
        const z = 0.01 + offsetZ; // We increates z each time a bit to prevent flickering. 
        element.position.set(x, y , z);

        group.add(element);
        offsetX = x + padding;
        offsetZ = z; 
    }
    // Place a year indicator on top
    const label = makeTextSprite(`${year}`, { fontsize: 50 });
    label.position.set(0, 20, 0);
    group.add(label);

    return group;
};