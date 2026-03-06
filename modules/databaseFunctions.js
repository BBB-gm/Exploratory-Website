const config = require("../config.json");
const mysql = require("mysql");

const DATABASE_NAME = "PaperTree";
const ACCOUNT_TABLE_CREATE = `CREATE TABLE IF NOT EXISTS Accounts (
  accountId int NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  password varchar(50) NOT NULL,
  PRIMARY KEY (accountId)
);`

const NODE_TABLE_CREATE = `CREATE TABLE IF NOT EXISTS Nodes (
  nodeId int NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  body varchar(8000) NOT NULL,
  authorId int NOT NULL,
  PRIMARY KEY (nodeId),
  FOREIGN KEY (authorId) REFERENCES Accounts(accountId)
);`

const LINK_TABLE_CREATE = `CREATE TABLE IF NOT EXISTS Links (
  linkId int NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  sourceNodeId int NOT NULL,
  targetNodeId int NOT NULL,
  PRIMARY KEY (linkId),
  FOREIGN KEY (sourceNodeId) REFERENCES Nodes(nodeId),
  FOREIGN KEY (targetNodeId) REFERENCES Nodes(nodeId)
);`

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: config.databasePassword
});
module.exports.dbConnected = new Promise((accept, reject)=>{
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    //confirm databases existance
    con.query("CREATE DATABASE IF NOT EXISTS "+DATABASE_NAME, (err, result) =>  {
      if (err) throw err;
      console.log("Database Exists");

      con.query("USE "+DATABASE_NAME, (err, result) =>  {
        if (err) throw err;
        console.log("Database selected");
        
        con.query(ACCOUNT_TABLE_CREATE, (err, result) => {
          if (err) throw err; 
          console.log("accounts exists");

          con.query(NODE_TABLE_CREATE, (err, result) => {
            if (err) throw err; 
            console.log("users exists");

            con.query(LINK_TABLE_CREATE,(err, result) =>  {
              if (err) throw err;
              console.log("statements exists");
              accept();
            });
          });
        });
      });
    });
  });
});

async function getUsernameFromId(accountId) {
  let result = await sql_query("SELECT * FROM Accounts WHERE accountId = "+accountId);

  if(result.length == 0){
    return "ACCOUNT NOT FOUND"
  } else {
    return result[0].username;
  }
}

async function sql_query(sql) {
  let promise = new Promise((resolve) => {
    con.query(sql, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });

  return promise;
}

module.exports.sql_query = sql_query;
module.exports.getUsernameFromId = getUsernameFromId;