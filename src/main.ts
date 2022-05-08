import './main.scss';
import { getBestOfItems, hasAnyItems, saveItems } from './storage/storage';
import { CdaItem, CdaItemCollection } from './types';

const app = document.querySelector<HTMLDivElement>("#app")!;

const createStreamItem = (item: CdaItem): HTMLDivElement => {
    const domItem = document.createElement('div');
    domItem.classList.add("item");

    const previewImgSrc = item.images.overall.images[0].sizes.medium.src;
    const title = item.metadata.title;
    const date = item.metadata.date;
    const type = item.medium.substring(0, item.medium.indexOf("(")).trim();
    const owner = item.repository;

    // Just build the inner DOM manually as we're going to use some 3D projection anyway
    // in the future.
    domItem.innerHTML = `
        <img alt=${title} src=${previewImgSrc} />
        <table class="metadata">
            <tr>
                <td>Titel</td>
                <td>${title}</td>
            </tr>
            <tr>
                <td>Datierung</td>
                <td>${date}</td>
            </tr>
            <tr>
                <td>Art</td>
                <td>${type}</td>
            </tr>
            <tr>
                <td>Besizer</td>
                <td>${owner}</td>
            </tr>
        </table>
    `;

    return domItem;
}

const renderItems = (items: CdaItem[]) => {
    // Clear children
    const stream = document.createElement("div");
    stream.classList.add("item-stream");
    for(const item of items) {
        stream.appendChild(createStreamItem(item));
    }
    app.innerHTML = '';
    app.appendChild(stream);
};

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
            
            renderItems(await getBestOfItems());
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
    
    app.innerHTML = '';
    app.appendChild(uploadBanner);
};

const init = async() => {
    // If we have already uploaded items in the storage, render the best of items.
    // Otherwise render the uploader
    if(!(await hasAnyItems())) {
        renderUploadBanner();
    } else {
        renderItems(await getBestOfItems());
    }
}

init()
    .then(() => console.log("Initilization completed"));