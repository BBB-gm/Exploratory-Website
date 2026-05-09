const titleHeader = document.getElementById("title");
const bodyParagraph = document.getElementById("body");
const linkDiv = document.getElementById("linkdiv");
const url = window.location.origin + "/papertree/node";
const editDiv = document.getElementById("edit");
const displayDiv = document.getElementById("display");
const editButton = document.getElementById("editButton");
const titleEditor = document.getElementById("titleEditor");
const bodyEditor = document.getElementById("bodyEditor");
const editBox = document.querySelector("div.editable");
const saveButton = document.getElementById("saveButton");
const newPageLink = document.getElementById("newPageLink");
const newLinkName = document.getElementById("newLinkName");
const newLinkTarget = document.getElementById("newLinkTarget");

var isEditing = false;
let query = parseQueryString(window.location.search);
console.log(query);
let pageNumber = parseInt(query.page);
if(query.editing === "true"){ // if this is undefined then this fails as well
    isEditing = true;
}
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
        let link = new Link(element.name,"papertree.html?page="+element.targetNodeId)
    
        linkDiv.insertBefore(link.render(document), newPageLink);
    });
})

editButton.addEventListener("click",e=>{
    swapModes(!isEditing);
});

saveButton.addEventListener("click",e=>{
    fetch(window.location.origin + "/papertree/updatePage", {
        method: "POST",
        body: JSON.stringify({
            title: titleEditor.value,
            body: bodyEditor.innerText,
            targetPage: pageNumber
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(r=>r.json()).then(r=>{query.editing = false; window.location.search=convertQueryToString(query)});
    
});

editBox.addEventListener("click",e=>{
    bodyEditor.focus();
})

linkDiv.addEventListener("click",e=>{
    if(e.target.tagName == "BUTTON"){
        
        document.location.href = e.target.dataset.ref;
    }
})
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

function onNewPageClick(){
    fetch(window.location.origin + "/papertree/newPage", {
        method: "POST",
        body: JSON.stringify({
            source: pageNumber,
            target: parseInt(newLinkTarget.value),
            linkName: newLinkName.innerText
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(r=>r.json()).then(r=>{console.log(r);document.location.href = "papertree.html?editing=true&page="+r.newPage});
}

function parseQueryString(queryString) {
    queryString = queryString.substring(1);
    parsedBody = {};

    params = queryString.split("&");
    params.forEach(e=>{
        let parts = e.split("=");
        parsedBody[parts[0]] = parts[1];
    })

    return parsedBody;
}

function convertQueryToString(query){
    let outputString = "?";

    Object.entries(query).forEach(e=>{
        outputString += e[0]+"="+e[1] + "&";
    });

    return outputString.substring(0, outputString.length - 1);
}