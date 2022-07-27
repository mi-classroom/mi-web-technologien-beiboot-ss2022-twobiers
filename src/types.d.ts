/* Dataset typings
---------------------------------------------------------------------------- */
export type CdaItemImage = {
    overall: {
        images: Array<{
            sizes: {
                medium: {
                    src: string;
                }
            }
        }>
    }
};

export type CdaItemMetadata = {
    title: string;
    date: string;
};

export type CdaItemDating = {
    dated: string;
    begin: number;
    end: number;
};

export type CdaInvolvedPerson = {
    name: string;
};

export type CdaInventoryNumber = string;

export type CdaItem = {
    objectId: number;
    metadata: CdaItemMetadata;
    medium: string;
    repository: string;
    isBestOf: boolean;
    images: CdaItemImage;
    sortingNumber: string;
    dimensions: string;
    dating: CdaItemDating;
    inventoryNumber: CdaInventoryNumber;
    involvedPersons: CdaInvolvedPerson[];
    references?: CdaReference[];
};

export type CdaReferenceType = "RELATED_IN_CONTENT_TO" | "SIMILAR_TO" | "BELONGS_TO" | "PART_OF_WORK";

export type CdaReference = {
    text: string;
    kind: CdaReferenceType;
    inventoryNumberPrefix: string | "";
    inventoryNumber: CdaInventoryNumber;
    remarks: unknown[];
};

export type CdaItemCollection = {
    items: CdaItem[];
};

/* 
---------------------------------------------------------------------------- */

export type Shape = "rectangle" | "circle";

export type RectDimension = {
    width: number;
    height: number;
    depth?: number;
};

export type CircleDimension = {
    diameter: number;
};

export type ItemRectDimensions = {
    shape: "rectangle";
    dimension: RectDimension;
};

export type ItemCircleDimensions = {
    shape: "circle";
    dimension: CircleDimension
};

export type ItemDimensions = ItemRectDimensions | ItemCircleDimensions;

export type DimensionizedCdaItem = CdaItem & { parsedDimensions: ItemDimensions };