const { checkGridExists, writeGridToFile, loadGridFromFile, loadAccountFromFile, checkAccountExists } = require("./modules/fileFunctions");
const { sendErrorResponse, validateRequestField, validateHexcode, validateNumberRange } = require("./modules/validationFunctions");
const { log } = require("./modules/generalFunctions");
const { validateAccountCredentials, validateAccountTrustable } = require("./modules/accountFunctions");
const config = require("./config.json");
const express = require('express');
var cors = require('cors');
var session = require('express-session');
const MemoryStore = require('memorystore')(session);

// DATA STRUCTURES
pixels = []; //defined at bottom
size = 100;

//live users
users = [];

// init
if(checkGridExists()){
    pixels = loadGridFromFile();
    size = pixels.length;
} else {
    for(var i = 0; i < size; i++){
        let lst = [];
        for(var ii = 0; ii < size; ii++){
            
            lst[ii] = "#FFFFFF";
        }
        pixels[i] = lst;
    }

    writeGridToFile(pixels);
}

//Catch if we're running locally or on GCS
const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // this automatically adds all requests to directories like /site.html for all files in /public


//Authentication
app.use(session({
    cookie: { maxAge: 86400000 }, // prune expired cookies every 24h
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    saveUninitialized: false,
    resave: false,
    secret: config.secret
}));

//account required on /protected pathways
app.use("/protected", (req, res, next) => {
    if(req.session) {        
        if (req.session.user) {
            next();
            return;
        }
    }
    res.redirect('/login.html');
});

//account with "admin" permission required on /admin pathways
app.use("/admin", (req, res, next) => {
    if(req.session){
        if(req.session.permissions){
            if(req.session.permissions.includes("admin")){
                next();
                return;
            }
        }
    }
    res.status(401).send();
});

//only a nickname is required on /light pathways
app.use("/light", (req, res, next)=>{
    if(req.session){
        if(req.session.user || req.session.nickname){
            next();
            return;
        }
    }
    res.redirect('/login.html?light');
})

app.use("/protected",express.static("protectedpublic"));
app.use("/light",express.static("lightpublic"));

app.use((req, res, next) => {
  if(req.method === "POST" && req.body === undefined){
    sendErrorResponse(res, "Invalid Content Type / Body");
  } else {
    next();
  }
});


app.get("/", function(req, res) {
    res.redirect("/login.html?light");
});

app.get("/light/updates", function(req, res) {
    log("Got updates check");

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    
    res.write("data: Hello! Fun fact, there are currently: "+users.length+" other people with this page open!\n\n");
    users.push(res);

    req.on("close", function(){
        log("Finishing update to certain user");
        let i = users.indexOf(res);
        if (i > -1) { // only splice array when item is found
            users.splice(i, 1); // 2nd parameter means remove one item only
        } else {
            log("WARNING: FAILED TO REMOVE ACTIVE CONNECTION");
        }
        res.end();
    })
});

app.post("/", function(req, res){
    
});

app.post("/light/canvas", function(req, res){
    
    if(validateNumberRange(req.body.x, res, "x", 0, size) && validateNumberRange(req.body.y, res, "y", 0, size)  && validateHexcode(req.body.color, res, "color") ){
        let x = req.body.x; //these are confirmed to be within allowed ranges;
        let y = req.body.y;
        let color = req.body.color;
        
        pixels[x][y] = color;
        
        
        writeGridToFile(pixels);

        res.send({success: true, message: "Success", grid: pixels});

        users.forEach(e => {
            log("Sending message");
            e.write("event: pixel\ndata: "+JSON.stringify(req.body)+"\n\n");
        })
        return;
    }
    //note, if this point is reached a response is already sent
});

app.get("/light/canvas", function(req, res){
    res.send(JSON.stringify({size: size, grid: pixels}));
});

app.post("/login", function(req, res){
    let body = req.body;

    if(validateRequestField(body.username,"string",res,"username") && validateRequestField(body.password,"string",res,"password")){
        let username = body.username;
        let password = body.password;

        let loginStatus = validateAccountTrustable(username,password);
        if(loginStatus != null){ //Data cannot be trusted
            sendErrorResponse(res,loginStatus);
            return;
        } 
        //username & password at this point can now be trusted as safe data

        //confirm that we recognize the login
        validateAccountCredentials(username,password).then((exists)=>{
            if(exists){
                req.session.regenerate(function(){
                    // Store the user's primary key
                    // in the session store to be retrieved,
                    // or in this case the entire user object
                    req.session.user = username;
                    req.session.permissions = loadAccountFromFile(username).permissions;
                    res.send({success: true});
            });
            } else {
                res.send({success: false, body: "account details incorrect"});
            }
        })
    }
    //note, if this point is reached a response is already sent
});

app.post("/lightlogin", function(req, res){
    let body = req.body;

    if(validateRequestField(body.username,"string",res,"username")){
        console.log(body);
        let username = body.username;
        let alphaNumeric = /^[0-9A-Za-z]+$/;

        if(!alphaNumeric.test(username)){ //Data cannot be trusted
            sendErrorResponse(res,"invalid nickname");
            return;
        } 
        //username & password at this point can now be trusted as safe data
        if(checkAccountExists(username)){ //name is therefore reserved.
            res.send({success:false, code: 1, body: "Nickname is already in use"});
            return;
        }

        req.session.regenerate(function(){
            // Store the user's primary key
            // in the session store to be retrieved,
            // or in this case the entire user object
            req.session.nickname = username;
            req.session.permissions = [];
            res.send({success: true});
        })
    }
    //note, if this point is reached a response is already sent
});

app.listen(PORT, () => log(`Server running on port ${PORT}`));