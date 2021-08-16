let ConnectionPool = require('tedious-connection-pool');
let config = require('../config');
var log = require("../log");
const Request = require('tedious').Request;

let poolConfig = {
  min: config.MSSQL_MIN_POOL_CONNECTIONS,
  max: config.MSSQL_MAX_POOL_CONNECTIONS,
  log: config.MSSQL_LOG
};

let connectionConfig = {
  userName: config.MSSQL_USER_NAME,
  password: config.MSSQL_PASSWORD,
  server: config.MSSQL_SERVER,
  "options": {
    "encrypt": true,
    "database": config.MSSQL_DATABASE_NAME,
    "useColumnNames": true
  }
};

//create the pool
let pool = new ConnectionPool(poolConfig, connectionConfig);

pool.on('error', function (err) {
  log(err);
});


const getConnection = () => new Promise((resolve, reject) => pool.acquire((err, conn) => err ? reject(err) : resolve(conn)));

let execute = function (requestString) {
  return new Promise(async function (resolve, reject) {
    let results = [];
    let connection;
    try{
      connection = (await getConnection());
    }catch(err){
      console.log("Error!!!");
      console.log(err);
    }
    
    const request = new Request(requestString, function (err) {
      if (err) {
        connection.release();
        log(err);
        reject(err);
      }
    });

    request.on('row', function (row) {
      results.push(row);
    });

    request.on('requestCompleted', function () {
      log('Finished');
      connection.release();
      resolve(results);
    });

    connection.execSql(request);
  });
}

module.exports = {
  getConnection: getConnection,
  execute: execute
}
