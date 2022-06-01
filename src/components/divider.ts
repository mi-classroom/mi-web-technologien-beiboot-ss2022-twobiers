export class Divider extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "open" });
        
        const dividerDiv = document.createElement("div");
        dividerDiv.classList.add("divider");

        shadow.appendChild(dividerDiv);
    }
}