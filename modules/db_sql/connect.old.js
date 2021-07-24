const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const config = require("../config");
const connection = new Connection(config);
var log = require("../log");
let instance = false;
let isDisconnecting = false;

module.exports = {
  connect: (callback) => {
    return new Promise((resolve, reject) => {
      connection.on('connect', function (err) {
        instance = true;
        if (err) {
          callback(err);
        } else {
          log("Connected SQL-Server");
          callback(null, connection);
        }
      });
    });
  },
  execute: function (connection, requestString, callback) {
    return new Promise((resolve, reject) => {
      let results = [];
      const request = new Request(requestString, function (err) {
        if (err) { log(err); } //reject(err);
        callback(err);
      });

      request.on('row', function (row) {
        results.push(row);
      });

      request.on('requestCompleted', function () {
        log('Finished');
        callback(null, results);
      });

      connection.execSql(request);
    });
  },
  disconnect: () => {
    //if (instance && !isDisconnecting) {
    isDisconnecting = true;
    return new Promise((resolve, reject) => {
      connection.on('end', function (err) {
        if (err) { reject(err); log(err) }
        log("Connection terminated");
        //instance = client;
        //resolve(client.db(config.options.database));
      });
    });
    //}
  },
  instance: () => {
    return instance;
  }
};