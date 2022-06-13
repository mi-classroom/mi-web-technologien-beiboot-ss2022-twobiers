export class UploadBanner extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "open" });

        const uploadBanner = document.createElement("div");
        uploadBanner.classList.add("upload-banner");
        const uploadContent = document.createElement("div");
        uploadContent.classList.add("upload-content");
    
        const fileUpload = document.createElement("input");
        fileUpload.id = "uploadFile";
        fileUpload.type = "file";
        fileUpload.accept = "application/json";
        fileUpload.addEventListener("change", (event: Event) => {
            this.dispatchEvent(event);
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
    
        uploadBanner.appendChild(document.createElement("app-divider"));
        uploadBanner.appendChild(uploadContent);
        uploadBanner.appendChild(document.createElement("app-divider"));
    
        shadow.appendChild(uploadBanner);
    }
}