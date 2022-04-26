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

export type CdaItem = {
    objectId: number;
    metadata: CdaItemMetadata;
    medium: string;
    repository: string;
    isBestOf: boolean;
    images: CdaItemImage;
    sortingNumber: string;
};

export type CdaItemCollection = {
    items: CdaItem[];
};