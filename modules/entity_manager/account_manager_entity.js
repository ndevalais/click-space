var connector = require("../db_sql/connector2");
var _ = require('lodash');
var log = require("../log");

var getAccountManager = async function ( UserTypeID, UserID ) {
  return new Promise(async (resolve, reject) => {

    try {
      const querySelect = `SELECT (
          SELECT
            UserID, Name, Logon, EMail, IsFirstLogin, IsAdmin, Image
          FROM Users
          WHERE UserTypeID = '--UserTypeID--' AND StatusID = 'A' --WHERE--
          FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
          ) AccountManager `;
      var where = '';
      var retorno = { };
      var query = querySelect.replace('--UserTypeID--', UserTypeID);
      if (UserID != "") {
        where = `AND UserID = ${UserID}`;
      }
      query = query.replace('--WHERE--', where);
      results = await connector.execute(query);
      if (results != undefined && results.length >= 0) {
        retorno = JSON.parse("[" + results[0].AccountManager + "]");
      }
 
      resolve(retorno);
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'User_does_not_exist' });
    }
  })
}

module.exports = {
  getAccountManager: getAccountManager
}