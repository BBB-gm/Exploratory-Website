// Developed by Ben Bennett, started on 3/3/2026
const fs = require("fs");
const schemaVersion = 1;
const databaseFunctions = require("../modules/databaseFunctions");
const express = require("express");

var rootNode = null;
var basePath = "";

function initPaperTree(app, pathIn){

    fetchNode(1).then((r) => {
        rootNode = r;
    });

    basePath = pathIn;

    app.use(basePath, express.static("./PaperTree/public"));
    app.get(basePath, (req, res)=>{
        res.redirect("papertree.html");

    });

    console.log(basePath+"/node")
    app.post(basePath+"/node", async (req, res)=>{
        
        if(typeof req.body.node === "number"){
            res.send(await nodeStringify(await fetchNode(req.body.node)));
        }
    });

    app.post(basePath+"/newPage", async (req, res)=>{
        if(typeof req.body.source === "number" && typeof req.body.linkName === "string" && typeof req.body.target === "number"){
            6
            let newPageID = await createNewPage(req.body.source);

            res.send({newPage: newPageID});
        }
    });

    app.post(basePath+"/updatePage", async (req, res)=>{
        if(typeof req.body.title === "string" && typeof req.body.body === "string" && typeof req.body.targetPage === "number"){
            await databaseFunctions.sql_query("UPDATE Nodes SET name='"+req.body.title+"', body='"+req.body.body+"' WHERE nodeId="+req.body.targetPage+";");
            res.send({body:"Done!"});
        }
    })
}


async function testingInit(){
    await databaseFunctions.dbConnected;

    let sql = "SELECT * FROM Accounts WHERE accountId = 1";
    let result = await databaseFunctions.sql_query(sql);
    if(result.length == 0){
        await databaseFunctions.sql_query("INSERT INTO Accounts (username, password) VALUES ('billy', 'joel');");
    }
}

async function fetchNode(id){
    await databaseFunctions.dbConnected;

    let sql = "SELECT * FROM Nodes WHERE nodeId = "+id;
    let result = await databaseFunctions.sql_query(sql);
    if(result.length > 0){
        //fetch and append its links
        let node = result[0];
        
        let sql = "SELECT * FROM Links WHERE sourceNodeId = "+id;
        
        result = await databaseFunctions.sql_query(sql);
        node.links = result;

        return node;
    } else {
        return null;
    }
}

async function createNewPage(sourceId) {
    await databaseFunctions.dbConnected;

    let newNode = createNodeObject("New Page","Text here",1);
    let newLink = createLinkObject("New Link", sourceId, -1);

    //the following transactions do not need to be atomic, as inserted ID is retrieved atomically, and the exact timing of the new link does not need to be deterministic.
    let sql = "INSERT INTO Nodes (name, body,authorId) VALUES ('"+newNode.name+"','"+newNode.body+"',"+newNode.authorId+");";
    let response = await databaseFunctions.sql_query(sql);

    sql = "INSERT INTO Links (name, targetNodeId, sourceNodeId) VALUES ('"+newLink.name+"',"+response.insertId+","+newLink.sourceNodeId+");"
    databaseFunctions.sql_query(sql); // needs not be awaited

    return response.insertId;
}

async function writeLink(link){
    await databaseFunctions.dbConnected;

    let sql = "INSERT INTO Links (name, targetNodeId, sourceNodeId) VALUES ('"+link.name+"',"+link.targetNodeId+","+link.sourceNodeId+");";
    
    await databaseFunctions.sql_query(sql);
}
function createNodeObject(name, body, authorId){
    let newNode = {
        name: name,
        body: body,
        authorId: authorId,
        version: schemaVersion,
    }

    return newNode;
}

function createLinkObject(name, sourceNodeId, targetNodeId) {
    return {
        name: name,
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId
    }
}

async function nodeStringify(node) {
    node.authorId = await databaseFunctions.getUsernameFromId(node.authorId);
    return JSON.stringify(node);
}


// writeNode(createNodeObject("Funky Monkey","Funkiest Monkey to ever funk",1)).then((r)=>{
     //writeLink(createLinkObject("Zoom on over to the monkster",1,5));
// })

module.exports.initPaperTree = initPaperTree;