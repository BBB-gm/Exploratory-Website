class Link {
    constructor(content, href, canEdit){
        this.content = content;
        this.href = href;
        this.canEdit = canEdit;
        this.isEditing = false;
    }

    render(document) {

        /*
        <div id="newPageLink" class="linkSection">
            <p>
                <span id="newLinkName" class="textarea centerContent halfEmRight" role="textbox" contenteditable></span>
                <select id="newLinkTarget" class="halfEmRight"><option value = -1>New Page</option></select>
                <button onclick=onNewPageClick() class="noPad"><img class="smallImg"src="plus-icon.svg"/></button>
            </p>
        </div>
        */
        let linkDiv = document.createElement("button");
        let linkText = document.createElement("p");

        linkDiv.classList.add("linkSection");

        linkDiv.dataset.ref = this.href;
        linkText.innerText = this.content;
        linkText.style.display = "inline-block"
        
        linkDiv.appendChild(linkText);

        if(this.canEdit){
            let editButton = document.createElement("button");
            let editIcon = document.createElement("img");

            editButton.classList.add("editButton");
            editIcon.classList.add("smallImg");

            editIcon.src = "plus-icon.svg";

            editButton.appendChild(editIcon);
            linkDiv.appendChild(editButton);
        }
        

        return linkDiv;
    }
}