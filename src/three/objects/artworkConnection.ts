import { LineCurve3, Mesh, MeshBasicMaterial, TubeGeometry, Vector3 } from "three";
import { Artwork3DObject } from "./artwork";

export class ArtworkConnection extends Mesh {
    public readonly name = "artworkConnection";

    constructor(source: Artwork3DObject, target: Artwork3DObject) {
        const sourcePoint = new Vector3();
        const targetPoint = new Vector3();
        source.getWorldPosition(sourcePoint);
        target.getWorldPosition(targetPoint);
        const curve = new LineCurve3(sourcePoint, targetPoint);

        const geometry = new TubeGeometry( curve, 100, 0.5, 8, false );
        const material = new MeshBasicMaterial( { color: 0x00ff00 } );
        super(geometry, material);
    }
}