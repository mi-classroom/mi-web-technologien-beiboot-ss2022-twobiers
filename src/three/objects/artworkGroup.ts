import * as THREE from "three";
import { makeTextSprite } from "../utils";
import { Artwork3DObject } from "./artwork";

export const createArtworkModelGroupOfYear = (year: number, objects: Artwork3DObject[]): THREE.Group => {
    const group = new THREE.Group();
    const artworkBox = new THREE.Box3();
    const groupBox = new THREE.Box3();
    const artworkBoxSize = new THREE.Vector3();
    const groupBoxSize = new THREE.Vector3();
    // Artworks will be placed NEXT to each other. 
    for(const element of objects) {
        artworkBox.setFromObject(element);
        groupBox.setFromObject(group);
        artworkBox.getSize(artworkBoxSize);
        groupBox.getSize(groupBoxSize);
        
        const x = groupBoxSize.x + artworkBoxSize.x;
        const y = artworkBoxSize.y / 2; // On ground
        const z = 0; // We don't need z as we're just two-dimensional in a group. The whole group will be moved on the z-axis
        element.position.set(x, y , z);
        
        group.add(element);
    }
    // Place a year indicator on top
    const label = makeTextSprite(`${year}`, { fontsize: 50 });
    label.position.set(0, 20, 0);
    group.add(label);

    return group;
};