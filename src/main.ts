import './main.scss';
import { getBestOfItems, hasAnyItems, saveItems } from './storage/storage';
import { getSceneCanvas, setArtworks } from './three/three';
import { trimBraces } from './three/utils';
import { CdaItemCollection, DimensionizedCdaItem } from './types';
import { parseDimensions } from './utils/dimensionParser';

const infoContainer: HTMLDivElement = document.getElementById("info")! as HTMLDivElement;

const showCanvas = () => {
    document.body.appendChild(getSceneCanvas());
}

const createDivider = (): HTMLSpanElement => {
    const divider = document.createElement("div");
    divider.classList.add("divider");
    return divider;
}

const renderUploadBanner = () => {
    const uploadBanner = document.createElement("div");
    uploadBanner.classList.add("upload-banner");
    const uploadContent = document.createElement("div");
    uploadContent.classList.add("upload-content");

    const fileUpload = document.createElement("input");
    fileUpload.id = "uploadFile";
    fileUpload.type = "file";
    fileUpload.accept = "application/json";
    fileUpload.addEventListener("change", async (event) => {
        const file = (event.target as HTMLInputElement).files?.item(0);
        if(!!file) {
            const content: CdaItemCollection = JSON.parse(await file.text());
            const result = await saveItems(content.items);
            console.log(`Successfully saved ${result.length} items in IndexDB`);
            uploadBanner.style.display = "none";
            
            showCanvas();
        }
    }, false);
    const fileUploadButton = document.createElement("input");
    fileUploadButton.classList.add("upload-button");
    fileUploadButton.type = "button";
    fileUploadButton.value = "Datensatz auswählen...";
    fileUploadButton.addEventListener("click", () => fileUpload.click());

    const fileUploadHeader = document.createElement("h2");
    fileUploadHeader.innerText = "Datensatz hochladen";

    uploadContent.appendChild(fileUploadHeader);
    uploadContent.appendChild(fileUpload);
    uploadContent.appendChild(fileUploadButton);

    uploadBanner.appendChild(createDivider());
    uploadBanner.appendChild(uploadContent);
    uploadBanner.appendChild(createDivider());

    document.body.appendChild(uploadBanner);
};

const init = async() => {
    // If we have already uploaded items in the storage, render the best of items.
    // Otherwise render the uploader
    if(!(await hasAnyItems())) {
        renderUploadBanner();
    } else {
        const bestOfItems = await getBestOfItems();
        // TODO: We could perform a migration in the IndexedDB and safe the parsed dimensions there.
        //       Leave it for the moment and see whether it works anyway.
        const dimensionizedBestOfItems = bestOfItems.map(item => {
            const dimensionized: DimensionizedCdaItem = {
                ...item,
                dimensions: parseDimensions(item.dimensions)
            }
            if(Object.values(dimensionized.dimensions.dimension).some(v => Number.isNaN(v))) {
                console.warn("There is a NaN value in parsed dimensions. Check your parser");
            }
            if(item.dating.begin === 1530) {
                console.log({
                    d1: item,
                    d2: dimensionized.dimensions
                });
            }
            return dimensionized;
        });

        showCanvas();

        await setArtworks(dimensionizedBestOfItems);
    }
};

const buildArtworkInfo = (artwork: DimensionizedCdaItem): HTMLDivElement => {
    const div = document.createElement("div");
    div.classList.add("info-container");

    div.innerHTML = `
        <h1>${artwork.metadata.title}</h1>
        <h2>${artwork.involvedPersons[0].name}</h2>
        <span>${trimBraces(artwork.medium)}</span>
        <span>${artwork.repository}</span>
    `;
    
    return div;
};

const addArtworkInfo = (artwork: DimensionizedCdaItem) => {
    console.log(artwork);
    const id = artwork.objectId;
    const existing = infoContainer.querySelector(`div[artwork-id="${id}"`);
    if(!existing) {
        const info = buildArtworkInfo(artwork);
        info.setAttribute("artwork-id", String(id));
        infoContainer.append(info);
    }
};

const removeArtworkInfo = (artwork: DimensionizedCdaItem) => {
    const id = artwork.objectId;
    const existing = infoContainer.querySelector(`div[artwork-id="${id}"`);
    existing?.remove();
};

init()
    .then(() => console.log("Initilization completed"));

document.addEventListener("highlight", (event: any) => addArtworkInfo(event.detail));
document.addEventListener("unhighlight", (event: any) => removeArtworkInfo(event.detail));