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

/**
 * Checks whether WebGL 2 is available in the current browser
 * @returns true if available
 */
export const isWebGL2Available = (): boolean => {
    try {
        const canvas = document.createElement('canvas');
        return !! (window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
        return false;
    }
};

/**
 * Trims different kinds of braces away from a given string.
 * Does not mutate the string.
 */
export const trimBraces = (str: string): string => {
    return str.split(/[\[\(]/g)[0];
};

/**
 * Creates HTMLElement with an error message about missing WebGL support
 */
export const getWebGLErrorMessage = (): HTMLDivElement => {
		const message = 'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>';

		const element = document.createElement( 'div' );
		element.id = 'webglmessage';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '5em auto 0';

		element.innerHTML = message;

		return element;
};

/**
 * Creates a three.js 2D text sprite 
 * @param message text that should be displayed in the sprite
 * @param properties customizations
 * @returns text sprite
 */
export const makeTextSprite = (message: string, properties: TextSpriteProperties = {}): THREE.Sprite => {
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

/**
 * Calculates the surface area of given dimensions
 * @param dimension dimensions
 * @returns surface area
 */
export const calcSurfaceArea = (dimension: ItemDimensions): number => {
    switch(dimension.shape) {
        case "circle":
            return Math.PI * Math.pow(dimension.dimension.diameter / 2, 2);
        case "rectangle":
            return dimension.dimension.width * dimension.dimension.height;
    }
};

export const dimToString = (dimension: ItemDimensions): string => {
    switch(dimension.shape) {
        case "circle":
            return `${dimension.dimension.diameter}cm, Fläche: ${calcSurfaceArea(dimension)}cm²`;
        case "rectangle":
            return `${dimension.dimension.width} x ${dimension.dimension.height} cm (bxh), Fläche: ${calcSurfaceArea(dimension)}cm²`;
    }
};

export const dataProxyUrl = (str: string): string => {
    if(!str.includes("imageserver-2022")) {
        throw Error(`Invalid URL provided: ${str}`);
    }
    return str.replaceAll("imageserver-2022", "data-proxy/image.php?subpath=");
}