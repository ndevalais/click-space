
var log = require("../modules/log")
//const c = require('../modules/constants');
var _ = require('lodash');
var entityAccountManager = require('../modules/entity_manager/account_manager_entity');
const { roughSizeOfObject } = require('../modules/tools/index');

var getAccountManager = async function(params){
  return new Promise (async (resolve,reject)=>{

    try {
      var UserTypeID = _.get(params, "usertypeid", 'ACM');
      var UserID = parseInt(_.get(params, "userid", 0));
      let timeInitial = Date.now();
      let timeTotal = 0;
      let temp = await entityAccountManager.getAccountManager( UserTypeID, UserID );

      let total = temp.length;

      // Obtengo size de la consulta y lo paso a kb
      let totalSize = await roughSizeOfObject(temp);
      totalSize = (totalSize)/1000;
      timeTotal = (Date.now() - timeInitial )/1000;

      resolve({ status: 'AccountManager_get', write_output: true, result: temp, total: total, time: timeTotal, size: totalSize });
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'AccountManager_get', write_output: true, error: error });
    }
  });
}

module.exports={
    getAccountManager: getAccountManager
}