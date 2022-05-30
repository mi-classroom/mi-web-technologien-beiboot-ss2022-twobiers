import { Pane } from "tweakpane";
import { controlProperties } from "./controls";
import { artworkProperties } from "./objects/artwork";
import { toStart } from "./objects/scene";

const pane = new Pane();

const resetBtn = pane.addButton({
    title: "Back to start"
});
resetBtn.on("click", toStart);

pane.addInput(artworkProperties, "highlightColor", {
    view: 'color'
});

pane.addInput(controlProperties, "movementSpeed", {
    view: "number",
    min: 0,
    max: 100
});

export default pane;