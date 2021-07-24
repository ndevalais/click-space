var log = require("../modules/log")
//const c = require('../modules/constants');
var _ = require('lodash');
var entityCampaigns = require('../modules/entity_manager/campaigns_entity');
const { roughSizeOfObject } = require('../modules/tools/index');

var getCampaigns = async function(params){
  return new Promise (async (resolve,reject)=>{

    try {
      let timeInitial = Date.now();
      let timeTotal = 0;
      let temp = []; //await entityCampaigns.campaignsStatus( CampaignID, StatusID );]

      let total = temp.length;

      // Obtengo size de la consulta y lo paso a kb
      let totalSize = await roughSizeOfObject(temp);
      totalSize = (totalSize)/1000;
      timeTotal = (Date.now() - timeInitial )/1000;

      resolve({ status: 'Campaigns_get', write_output: true, result: temp, total: total, time: timeTotal, size: totalSize });
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'Campaigns_get', write_output: true, error: error });
    }
  });
}

var campaignsStatus = async function(params) {
  return new Promise (async (resolve,reject)=>{

    try {
      const CampaignID = parseInt(_.get(params,"campaignid"));
      const StatusID = _.get(params,"statusid");      
      let timeInitial = Date.now();
      let timeTotal = 0;
      let temp = await entityCampaigns.campaignsStatus( CampaignID, StatusID );

      let total = temp.modifiedCount;

      // Obtengo size de la consulta y lo paso a kb
      let totalSize = await roughSizeOfObject(temp);
      totalSize = (totalSize)/1000;
      timeTotal = (Date.now() - timeInitial )/1000;

      resolve({ status: 'Campaigns_UpdateStatus', write_output: true, result: temp, total: total, time: timeTotal, size: totalSize });
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'Campaigns_UpdateStatus', write_output: true, error: error });
    }
  });
}

module.exports={
  getCampaigns: getCampaigns,
  campaignsStatus: campaignsStatus
}