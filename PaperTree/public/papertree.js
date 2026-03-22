const titleHeader = document.getElementById("title");
const bodyParagraph = document.getElementById("body");
const linkDiv = document.getElementById("linkdiv");
const url = window.location.origin + "/papertree/node";
const editDiv = document.getElementById("edit");
const displayDiv = document.getElementById("display");
const editButton = document.getElementById("editButton");
const titleEditor = document.getElementById("titleEditor");
const bodyEditor = document.getElementById("bodyEditor");

var isEditing = false;
let pageNumber = parseInt(window.location.search.substring(1));

swapModes(isEditing);

if(isNaN(pageNumber)){
    console.log("hey")
    pageNumber = 1;
} else {
    console.log(typeof pageNumber)
}

fetch(url, {
    method: "POST",
    body: JSON.stringify({
        node: pageNumber,
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
}).then((response) => response.json())
    .then((json)=>{
    
    titleHeader.innerText = json.name;
    titleEditor.value = json.name;

    bodyParagraph.innerText = json.body;
    bodyEditor.innerText = json.body;

    json.links.forEach(element => {
        console.log(element);
        let newLink = document.createElement("a");

        //newLink.classList.add("link")
        newLink.innerText = element.name;
        newLink.href = "papertree.html?"+element.targetNodeId;

        linkDiv.appendChild(newLink);
    });
})

editButton.addEventListener("click",e=>{
    swapModes(!isEditing);
});

function swapModes(isEditingNew){
    if(isEditingNew){
        editDiv.style.display = "flex";
        displayDiv.style.display = "none";
    } else {
        editDiv.style.display = "none";
        displayDiv.style.display = "flex";
    }
    isEditing = isEditingNew;
}