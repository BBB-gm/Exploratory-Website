class Link {
    constructor(content, href){
        this.content = content;
        this.href = href;
    }

    render(document) {
        let linkButton = document.createElement("button");
        

        linkButton.classList.add("linkSection");

        linkButton.dataset.ref = this.href;
        linkButton.innerText = this.content;

        return linkButton;
    }
}

class NewLink {
    constructor(){

    }

    render(document) {

        let linkDiv = document.createElement("div");
        let innerHTML = ""
        
        linkDiv.innerHTML = innerHTML;
        linkDiv.classList.add("linkSection");

        return linkDiv;
    }
}