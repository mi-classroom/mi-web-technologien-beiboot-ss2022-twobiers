import * as THREE from "three";
import { ItemDimensions } from "../types";

interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface TextSpriteProperties {
    fontface?: string;
    fontsize?: number;
    borderThickness?: number;
    borderColor?: Color;
    backgroundColor?: Color;
    textColor?: Color;
};

export const makeTextSprite = (message: string, properties: TextSpriteProperties = {}) => {
    const fontface = properties.fontface ? properties.fontface : "Courier New";
    const fontsize = properties.fontsize ? properties.fontsize : 18;
    const borderThickness = properties.borderThickness ? properties.borderThickness : 4;
    const borderColor = properties.borderColor ? properties.borderColor : { r: 0, g: 0, b: 0, a: 1.0 };
    const backgroundColor = properties.backgroundColor ? properties.backgroundColor : { r: 0, g: 0, b: 255, a: 1.0 };
    const textColor = properties.textColor ? properties.textColor : { r: 255, g: 255, b: 255, a: 1.0 };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = "Bold " + fontsize + "px " + fontface;

    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
    context.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
    context.fillText(message, borderThickness, fontsize + borderThickness);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    return sprite;
};

export const calcSurfaceArea = (dimension: ItemDimensions): number => {
    switch(dimension.shape) {
        case "circle":
            return Math.PI * Math.pow(dimension.dimension.diameter / 2, 2);
        case "rectangle":
            return dimension.dimension.width * dimension.dimension.height;
    }
};