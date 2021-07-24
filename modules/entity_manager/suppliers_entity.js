var connector = require("../db_sql/connector2");
var _ = require('lodash');
var log = require("../log");


/**
 * Suppliers  --> Users (AccountManager)
 *            --> Advertisers 
 *            --> Groups
 * 
 * Consulta de query de todos los suppliers
 * db.getCollection('Suppliers').insertMany([ {....} ])
 */
const querySelect = `SELECT (
  SELECT 
    SupplierID, 
    Supplier,
    PostBackSendEvents,
    AccountManagerID,
    ControlIP,
    StatusID,
    CreationDate,
    UpdateDate,
    CreationUserID,
    UpdateUserID,
    AdvertiserID,
    ApiKey,
    GroupID,
    Click2
  FROM Suppliers
  FOR JSON PATH , WITHOUT_ARRAY_WRAPPER)
  Suppliers`

var getSuppliers = async function (Api) {
  return new Promise(async (resolve, reject) => {
    try {
      let Result = ['EN DESARROLLO'];

      resolve(Result);
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'Suppliers_does_not_exist' });
    }
  })
}

module.exports = {
  getSuppliers: getSuppliers
}