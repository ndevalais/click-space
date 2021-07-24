var db = require('../db/index');
var _ = require('lodash');
let moment = require("moment");
var log = require("../log");
const COLLECTION_NAME = "ApiCustomers";

var getApiCustomers = async function (Api) {
  return new Promise(async (resolve, reject) => {
    try {
      let Result = await db.connection().collection(COLLECTION_NAME).find(
        { 'Api': Api }
      ).toArray();

      resolve(Result);
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'ApiCustomers_does_not_exist' });
    }
  })
}


module.exports = {
  getApiCustomers: getApiCustomers
}