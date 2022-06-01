import { Pane } from "tweakpane";
import { controlProperties } from "./controls";
import { artworkProperties } from "./objects/artwork";
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
// import { scene } from "./three";

const pane = new Pane();
pane.registerPlugin(EssentialsPlugin);

const fpsGraph = pane.addBlade({
    view: "fpsgraph",
    label: "fps",
    lineCount: 2,
});

const highlightFolder = pane.addFolder({
    title: "Highlight",
    expanded: true
});
highlightFolder.addInput(artworkProperties, "enableVisualHighlight", {
    label: "Visual Highlighting"
});

highlightFolder.addInput(artworkProperties, "highlightColor", {
    view: "color",
    label: "Highlight Color"
});

const controlFolder = pane.addFolder({
    title: "Controls",
    expanded: true
});
const resetBtn = controlFolder.addButton({
    title: "Back to start"
});
// resetBtn.on("click", scene.resetCamera);
controlFolder.addInput(controlProperties, "movementSpeed", {
    view: "number",
    label: "Movement Speed",
    min: 0,
    max: 100
});

controlFolder.addInput(controlProperties, "zoomAmount", {
    view: "number",
    label: "Zoom Level",
    min: 0,
    max: 100
});

export default pane;

export { fpsGraph };