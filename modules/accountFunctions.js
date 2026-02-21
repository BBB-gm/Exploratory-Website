const {writeAccountToFile, loadAccountFromFile, checkAccountExists } = require("./fileFunctions");
const accountVersionCode = "1.0";
const bcrypt = require("bcrypt");

async function generateHash(plaintextPasscode){
    let salt = await bcrypt.genSalt();
    let hash = await bcrypt.hash(plaintextPasscode,salt);
    return hash;
}

function createAccount(username, plaintextPasscode){
    
    generateHash(plaintextPasscode).then((passwordHash)=>{
        let defaultAccount = { 
            version: accountVersionCode,
            username: username,
            passwordHash: passwordHash,
            permissions: [],
        }
        writeAccountToFile(username, defaultAccount);
    });
}

function validateAccountTrustable(username, plaintextPasscode){
    let alphaNumeric = /^[0-9A-Za-z]+$/;
    let alphaNumericSpecial = /^[0-9A-Za-z#$@&]+$/;

    if(alphaNumeric.test(username) && username.length <= 25){
        if(alphaNumericSpecial.test(plaintextPasscode) && plaintextPasscode.length <= 25){
            return null;
        } else {
            return "password is invalid";
        }
    } else {
        return "username is invalid";
    }
}

async function validateAccountCredentials(username, plaintextPasscode){
    if(checkAccountExists(username)){
        let data = loadAccountFromFile(username);

        return await bcrypt.compare(plaintextPasscode, data.passwordHash);
    }

    return false;
}

module.exports.generateHash = generateHash;
module.exports.createAccount = createAccount;
module.exports.validateAccountCredentials = validateAccountCredentials;
module.exports.validateAccountTrustable = validateAccountTrustable;