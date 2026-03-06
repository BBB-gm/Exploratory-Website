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

    app.use(basePath, express.static("./PaperTree/public"))
    app.get(basePath, (req, res)=>{
        res.redirect("papertree.html")
        //
    })
    console.log(basePath+"/node")
    app.post(basePath+"/node", async (req, res)=>{
        console.log("hi");
        if(typeof req.body.node === "number"){
            res.send(await nodeStringify(await fetchNode(req.body.node)));
        }
    })
}


async function testingInit(){
    await databaseFunctions.dbConnected;

    let sql = "SELECT * FROM Accounts WHERE accountId = 1";
    let result = await databaseFunctions.sql_query(sql);
    if(result.length == 0){
        await databaseFunctions.sql_query("INSERT INTO Accounts (username, password) VALUES ('billy', 'joel');")
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

async function writeNode(node) {
    await databaseFunctions.dbConnected;

    let sql = "INSERT INTO Nodes (name, body,authorId) VALUES ('"+node.name+"','"+node.body+"',"+node.authorId+");";
    
    await databaseFunctions.sql_query(sql);
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