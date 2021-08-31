const MongoClient = require("mongodb").MongoClient;
const Logger = require('mongodb').Logger;
const config = require('../../modules/config');
const connString = config.MONGO_CONNECTION_STRING;;
var log = require("../log");

//const connString = `mongodb://${config.MONGO_DB_USERNAME}:${config.MONGO_DB_PRIMARY}@${config.MONGO_DB_HOST}:${config.MONGO_DB_PORT}/?ssl=true`; //&sslverifycertificate=false
//const connString = `mongodb://${config.MONGO_DB_USERNAME}:${config.MONGO_DB_PRIMARY}@${config.MONGO_DB_HOST}:${config.MONGO_DB_PORT}/${config.MONGO_DB_NAME}?ssl=false`; //&sslverifycertificate=false
//const connString = `mongodb://localhost:27017`;

var instance = null;
var isDisconnecting = false;
var isConnected = false;
var db, client;

var options = {
  numberOfRetries : 5, 
  auto_reconnect: true, 
  poolSize : config.MONGO_DB_POOL_SIZE, 
  connectTimeoutMS: 500,
  useNewUrlParser: true  
};

module.exports = {
    connect: async () => {
      return new Promise(async function(resolve, reject){
        try {
          if(isConnected==true) {
            console.log("Returning connection:");
            resolve (db);
          }
          console.log("Connecting Mongo DB....");
          client = await MongoClient.connect(connString, options);
          
          Logger.setLevel(config.MONGO_DEBUG_LEVEL);  
          Logger.setCurrentLogger(function(msg, context) {
            log("MONGO:",msg, context);
          });
  
          instance = client;
          db = await client.db(config.MONGO_DB_NAME);
          db.
          isConnected=true;
          console.log(`Mongo DB, Connection READY! - ${config.MONGO_DB_NAME}`);
          resolve(db)
        }catch(e){
          isConnected=false;          
          reject("Error connecting to mongo:", e);
        } finally {
          //client.close();
        }
      })
    },
    disconnect: async () => {
        if (instance && !isDisconnecting) {
            isDisconnecting = true;
            log("Desconectando instancia de Mongo");
            instance.close();            
        }
    },
    instance: () => {
      console.log("Returning instance:");
        return instance;
    },
    connection: () => {      
      return db;
    }
};



