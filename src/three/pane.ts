import { Pane } from "tweakpane";
import { controlProperties } from "./controls";
import { artworkProperties } from "./objects/artwork";
import { resetCamera } from "./objects/scene";

const pane = new Pane();

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
resetBtn.on("click", resetCamera);
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