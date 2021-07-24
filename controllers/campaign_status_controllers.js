const c = require('../modules/constants');
var entityManager = require('../modules/entity_manager');
var _ = require('lodash');
var log = require("../modules/log")
const counters = require('../modules/counters');

var getCampaignInfo = async function(params){
    return new Promise (async (resolve,reject)=>{
      // Otengo parametros
      let offer;
      let result=[];
      const campaignid = _.get(params,"campaignid");
      const IPLong = parseInt( _.get(params, "AdditionalIPInfo.IP_No",0) );

      // Otengo Ofertas de la Campaign
      entityManager.oe.getOffersCampaign(campaignid).then(async function (Offers) {

        for (var i = 0; i < Offers.length; i++) {
          offer = await entityManager.getOfferByUUID(Offers[i].OfferGUID, params.subpubid, IPLong);
          result.push(offer)
        }

        resolve({
          write_output:true,
          process_from: 'getCampaignInfo', 
          status: 'all_validators_ok', 
          offers: result,
          param: params,
          globalCounters:counters.globalCounters
        });

      }).catch(function (err) {
        log(err);
        reject(
            {
              status: 'Campaign_does_not_exist',
              params: params
            }
        );
      });

      /*if (!Offers) {
        reject(
            {
                status: 'Campaign_does_not_exist',
                param: params,
            }
        );
      }*/

    });
}

module.exports={
  getCampaignInfo:getCampaignInfo
}