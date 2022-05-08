import './main.scss';
import { getBestOfItems, hasAnyItems, saveItems } from './storage/storage';
import { CdaItem, CdaItemCollection } from './types';

const toolbar = document.querySelector<HTMLDivElement>("#toolbar")!;
const itemStream = document.querySelector<HTMLDivElement>("#item-stream")!;

const createStreamItem = (item: CdaItem): HTMLDivElement => {
    const domItem = <HTMLDivElement>(document.createElement('div'));
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
    itemStream.innerHTML = '';
    for(const item of items) {
        itemStream.appendChild(createStreamItem(item));
    }
};

const init = async() => {
    // TODO: Render toolbar conditionally
    if(await hasAnyItems()) {
        toolbar.style.display = "none";
        renderItems(await getBestOfItems());
    } else {
        const uploadFile = document.querySelector<HTMLInputElement>("#uploadFile")!;
        uploadFile.addEventListener("change", async (event) => {
            const file = (event.target as HTMLInputElement).files?.item(0);
            if(!!file) {
                const content: CdaItemCollection = JSON.parse(await file.text());
                const result = await saveItems(content.items);
                console.log(`Successfully saved ${result.length} items in IndexDB`);
                toolbar.style.display = "none";
                
                renderItems(await getBestOfItems());
            }
        }, false);
    }
}

init()
    .then(() => console.log("Initilization completed"));