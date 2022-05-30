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
    involvedPersons: CdaInvolvedPerson[];
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