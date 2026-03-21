const titleHeader = document.getElementById("title");
const bodyParagraph = document.getElementById("body");
const linkDiv = document.getElementById("linkdiv");
const url = window.location.origin + "/papertree/node";

let pageNumber = parseInt(window.location.search.substring(1));

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
    bodyParagraph.innerText = json.body;
    json.links.forEach(element => {
        console.log(element);
        let newLink = document.createElement("a");

        newLink.innerText = element.name;
        newLink.href = "papertree.html?"+element.targetNodeId;

        linkDiv.appendChild(newLink);
    });
})