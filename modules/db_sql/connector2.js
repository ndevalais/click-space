//const sql = require('mssql')
let config = require('../config');

let execute = async function (requestString) {
  return new Promise(async function (resolve, reject) {
    try {      
      let connectionString=`mssql://${config.MSSQL_USER_NAME}:${config.MSSQL_PASSWORD}@${config.MSSQL_SERVER}/${config.MSSQL_DATABASE_NAME}?encrypt=true`;      
      //await sql.connect(connectionString)
      //TODO: Esto es inseguro, sanitizar input strings.
      //const result = await sql.query(requestString);    
      //resolve(result.recordset);
      resolve({});
    } catch (err) {
      console.log("Error executing query:", err);
      reject(err);      
    }
  });
}


module.exports = {  
  execute: execute
}
