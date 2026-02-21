const fs = require('fs');
const gridFilePath = "./canvas.json";
const accountFilePath = "./accounts/";

function checkGridExists(){
    return fs.existsSync(gridFilePath);
}

function loadGridFromFile(){
    let file = JSON.parse(fs.readFileSync(gridFilePath));
    
    return file.grid;
}

function writeGridToFile(grid){
    fs.writeFileSync(gridFilePath,JSON.stringify({grid:grid}));
}

function getAccountFilepath(accountName){ //this function is for internal use only
    return accountFilePath+accountName+".json";
}

function checkAccountExists(accountName){
    accountName = accountName.toLowerCase()
    return fs.existsSync(getAccountFilepath(accountName));
}

function loadAccountFromFile(accountName){
    return JSON.parse(fs.readFileSync(getAccountFilepath(accountName)));
}

function writeAccountToFile(accountName, accountData){
    fs.writeFileSync(getAccountFilepath(accountName), JSON.stringify(accountData));
}

module.exports.checkGridExists = checkGridExists;
module.exports.loadGridFromFile = loadGridFromFile;
module.exports.writeGridToFile = writeGridToFile;

module.exports.checkAccountExists = checkAccountExists;
module.exports.loadAccountFromFile = loadAccountFromFile;
module.exports.writeAccountToFile = writeAccountToFile;