var connector = require("../db_sql/connector2");
var _ = require('lodash');
var log = require("../../modules/log");

var getUser = async function (AccessToken) {
  return new Promise(async (resolve, reject) => {

    try {
      const querySelect = `SELECT UserTypeID, SupplierID, AdvertiserID, Name, Logon, 
                          CASE UserTypeID WHEN 'ACM' THEN UserID ELSE 0 END AS filtroAccountADV,
                          CASE UserTypeID WHEN 'ACM' THEN UserID ELSE 0 END AS filtroAccountSUP
                      FROM [dbo].[Users]
                      WHERE UserID = --UserID--`;
      var retorno = { UserID: 0, UserTypeID: 'ENT', SupplierID: 0, AdvertiserID: 0 };
      const lOk = false
      if (AccessToken != "") {

        results1 = await connector.execute(`SELECT ISNULL(UserID,0) AS UserID FROM [dbo].[FN_VALIDATE_UserByAccessToken] ('${AccessToken}')`);
        if (results1.length > 0) {
          retorno.UserID = results1[0].UserID;
          const query = querySelect.replace('--UserID--', retorno.UserID);
          results2 = await connector.execute(query);
          if (results2.length > 0) {
            retorno.Name = results2[0].Name;
            retorno.Logon = results2[0].Logon;
            retorno.UserTypeID = results2[0].UserTypeID;
            retorno.SupplierID = results2[0].SupplierID;
            retorno.AdvertiserID = results2[0].AdvertiserID;
            retorno.filtroAccountADV = results2[0].filtroAccountADV;
            retorno.filtroAccountSUP = results2[0].filtroAccountSUP;
          }
        }
      } else {
        throw Error('AccessTokenNotBeDefined');
      }
      resolve(retorno);
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'User_does_not_exist' });
    }
  })
}

var authenticateCode = async function (params, AccessToken) {
  return new Promise(async (resolve, reject) => {
    try {
      let ApiKey = _.get(params, "apikey", "");
      let results1;
      let results2;
      let querySelect;
      let query1;
      let query2;

      querySelect = `SELECT UserTypeID, SupplierID, AdvertiserID, Name, 
               (Select ParamValue 
                FROM Parameters 
               WHERE ParamName = 'ConsolidateLastUpdateDate') 'ConsolidateLastUpdateDate'
         FROM [dbo].[Users]
        WHERE UserID = --UserID--`;

      var retorno = { 
        UserID: 0, 
        Name: '', 
        UserTypeID: 'ENT', 
        SupplierID: 0, 
        AdvertiserID: 0,
        ConsolidateLastUpdateDate: '',
        ApiKey: '',
        status: 'OK'
      };

      const lOk = false
      if (ApiKey == '') {
        // Busco Usuario por AccesToken
        query1 = `SELECT 
          ISNULL(UserID,0) AS RegisteredUserID 
          FROM [dbo].[FN_VALIDATE_UserByAccessToken] ('${AccessToken}')`
        results1 = await connector.execute(query1);
        if (results1.length > 0) {
          retorno.UserID = results1[0].RegisteredUserID;
          query2 = querySelect.replace('--UserID--', retorno.UserID);
          results2 = await connector.execute(query2);
          if (results2.length > 0) {
            retorno.Name = results2[0].Name;
            retorno.UserTypeID = results2[0].UserTypeID;
            retorno.SupplierID = results2[0].SupplierID;
            retorno.AdvertiserID = results2[0].AdvertiserID;
            retorno.ConsolidateLastUpdateDate = results2[0].ConsolidateLastUpdateDate;
          } else {
						lOk = false;
            reject({ status: 'Invalid User or Session' });
          }
        }
      } else {
        // usco Usuario por ApiKey
        query1 = `Select 
          0 UserTypeID, 
          SupplierID, 
          0 AdvertiserID, 
          Name,  
          (Select ParamValue 
             FROM Parameters
            WHERE ParamName = 'ConsolidateLastUpdateDate') 'ConsolidateLastUpdateDate' 
          FROM Suppliers WHERE ApiKey = '${ApiKey}'`;
          
        results1 = await connector.execute(query1);
        if (results1.length > 0) {
          retorno.ApiKey = ApiKey;
          retorno.UserID = results1[0].RegisteredUserID;
          retorno.Name = results1[0].Name;
          retorno.UserTypeID = results1[0].UserTypeID;
          retorno.SupplierID = results1[0].SupplierID;
          retorno.AdvertiserID = results1[0].AdvertiserID;
          retorno.ConsolidateLastUpdateDate = results1[0].ConsolidateLastUpdateDate;
        } else {
          lOk = false;
          reject({ status: 'Invalid ApiKey' });
        }

      }
      resolve(retorno);

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'User_does_not_exist' });
    }
  })

}

module.exports = {
  getUser: getUser,
  authenticateCode: authenticateCode
}