import { Pane } from "tweakpane";
import { controlProperties } from "./controls";
import { artworkProperties } from "./objects/artwork";
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { CranachScene, sceneProperties } from "./scene";

export class CranachPane extends Pane {
    public readonly fpsGraph;

    constructor(scene: CranachScene) {
        super();
        this.registerPlugin(EssentialsPlugin);

        this.fpsGraph = this.addBlade({
            view: "fpsgraph",
            label: "fps",
            lineCount: 2,
        });

        const debugFolder = this.addFolder({
            title: "Debug",
            expanded: false
        });

        debugFolder.addInput(sceneProperties, "enableHelpers", {
            label: "Show Helpers"
        }).on("change", (event) => scene.toggleHelpers(event.value));

        const highlightFolder = this.addFolder({
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

        const controlFolder = this.addFolder({
            title: "Controls",
            expanded: true
        });
        const resetBtn = controlFolder.addButton({
            title: "Back to start"
        });
        resetBtn.on("click", scene.resetCamera);
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
    }
}