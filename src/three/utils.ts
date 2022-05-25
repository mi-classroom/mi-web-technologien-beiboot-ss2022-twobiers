import * as THREE from "three";


export const makeTextSprite = (message: string) => {
    const fontface = "Courier New";
    const fontsize = 18;
    const borderThickness = 4;
    const borderColor = { r: 0, g: 0, b: 0, a: 1.0 };
    const backgroundColor = { r: 0, g: 0, b: 255, a: 1.0 };
    const textColor = { r: 255, g: 255, b: 255, a: 1.0 };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = "Bold " + fontsize + "px " + fontface;
    const metrics = context.measureText(message);

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