import * as THREE from "three";
import { Raycaster } from "three";
import { DimensionizedCdaItem } from "../types";
import { animateControls } from "./controls";
import { getWebGLErrorMessage, isWebGL2Available } from "./utils";
import { Artwork3DObject } from "./objects/artwork";
import { ArtworkGroup } from "./objects/artworkGroup";
import { CranachScene } from "./scene";
import { CranachPane } from "./pane";

if(!isWebGL2Available()) {
    document.body.appendChild(getWebGLErrorMessage());
    throw new Error("WebGL is not supported");
}

const scene = new CranachScene();

// @ts-ignore
const _pane = new CranachPane(scene); // Keep to show the pane

const animate = () => {
    //@ts-ignore
    _pane.fpsGraph.begin();
    requestAnimationFrame( animate );
    
    scene.update();
    
    //@ts-ignore
    _pane.fpsGraph.end();
};

animate();

export { scene };