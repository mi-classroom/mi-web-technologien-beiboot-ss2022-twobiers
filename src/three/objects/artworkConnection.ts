import { CatmullRomCurve3, ColorRepresentation, Mesh, MeshBasicMaterial, TubeGeometry, Vector3 } from "three";
import { Artwork3DObject } from "./artwork";

export class ArtworkConnection extends Mesh {
    public readonly name = "artworkConnection";

    constructor(source: Artwork3DObject, target: Artwork3DObject, color: ColorRepresentation) {
        const sourcePoint = new Vector3();
        const targetPoint = new Vector3();
        source.getWorldPosition(sourcePoint);
        target.getWorldPosition(targetPoint);
        
        // Buttom of artwork
        sourcePoint.y -= (source.height / 2) * 10;
        targetPoint.y -= (target.height / 2) * 10;


        // On the ground
        const startGround = new Vector3().copy(sourcePoint);
        startGround.y = 0.5;
        const endGround = new Vector3().copy(targetPoint);
        endGround.y = 0.5;

        const curve = new CatmullRomCurve3([sourcePoint, startGround, endGround, targetPoint ], false, "catmullrom", 0.1);

        const geometry = new TubeGeometry( curve, 100, 0.1, 8, false );
        const material = new MeshBasicMaterial( { color } );
        super(geometry, material);
    }
}