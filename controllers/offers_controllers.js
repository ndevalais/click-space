var entityManager = require('../modules/entity_manager');
var appsNames = require('./appsnames_controllers');
var log = require("../modules/log");
var _ = require('lodash');
var query = require('../modules/querys');
var connector = require("../modules/db_sql/connector2");
const HttpRequest = require('request');

async function asyncRequest(url, arrheaders = [], user = '', password = '', method = 'GET') {
  try {
    var headers = {'Content-type': 'application/json'};
    // Agrego valores al Header
    for (let i in arrheaders) {
      headers = Object.assign(headers, arrheaders[i]);
    }

    let options = {
      url: url,
      method: method,
      headers: headers,
      rejectUnauthorized: false,
      requestCert: false,
      json: true
    };

    if (user!='' && password!= '') {
      options.form = {
        'user': user,
        'password': password
      }
    }
    let retorno = new Promise((resolve, reject) => {
      HttpRequest(options, (error, response, body) => resolve({ error, response, body }));
    });
    return retorno;
  } catch (error) {
    log('Error ' + error + ' rows');
    reject({ status: 'asyncRequest_error' });
  }
}
//const c = require('../modules/constants');
var registerOffers = function (params) {
  return new Promise(async (resolve, reject) => {
    const queryUpdate = query.offer;
    let blAdvertiser = [];
    let blCampaign = [];
    let blOffer = [];
    let wlAdvertiser = [];
    let wlCampaign = [];
    let wlOffer = [];

    try {
      log('Add/Update Ofertas.');
      let promiseArray = [];
      const campaignid = params.campaignid;
      const query = queryUpdate.replace('__CAMPAIGN_ID__', campaignid);
      let res = await connector.execute(query);

      if (res != undefined && res[0].Offer != null) {
        const Offer = JSON.parse("[" + res[0].Offer + "]");
        const AdvertiserID = Offer[0].Advertiser.AdvertiserID;
        const CampaignID = Offer[0].Campaign.CampaignID;

        blAdvertiser = await appsNames.getAppsNamesBLAdvertiser(AdvertiserID);
        blCampaign = await appsNames.getAppsNamesBLCampaign(CampaignID);

        wlAdvertiser = await appsNames.getAppsNamesWLAdvertiser(AdvertiserID);
        wlCampaign = await appsNames.getAppsNamesWLCampaign(CampaignID);

      }

      res.forEach(async item => {

        let temp = async (item) => {
          try {
            const offer = JSON.parse(_.get(item, 'Offer', {}));
            let OfferID = parseInt(_.get(item, 'OfferID', 0));
            blOffer = await appsNames.getAppsNamesBLOffer(OfferID);
            wlOffer = await appsNames.getAppsNamesWLOffer(OfferID);
            offer.WhiteList = wlOffer;
            offer.Campaign.WhiteList = wlCampaign;
            offer.Advertiser.WhiteList = wlAdvertiser;
            offer.BlackList = blOffer;
            offer.Campaign.BlackList = blCampaign;
            offer.Advertiser.BlackList = blAdvertiser;
            log( `Inserted/Update a document into the Offer ${OfferID}.`);
            return entityManager.oe.saveOffer(OfferID, offer);
          } catch (err) {
            throw `Error Inserted/Update a document into the Offer ${err}.`;
          }

        }
        promiseArray.push(temp(item));
      });

      Promise.all(promiseArray).then(function(){
        resolve({ status: 'campaigns_by_offers_updated'});
      });
      

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'offer_does_not_exist', error: error });
    }

  });
}

var registerOffersGuid = function (OfferGUID) {
  return new Promise(async (resolve, reject) => {
    const queryUpdate = query.OfferGUID;
    let blAdvertiser = [];
    let blCampaign = [];
    let blOffer = [];
    let wlAdvertiser = [];
    let wlCampaign = [];
    let wlOffer = [];

    try {
      log('Add/Update Ofertas.');
      let promiseArray = [];
      const query = queryUpdate.replace('__OFFERGUID__', OfferGUID);
      let res = await connector.execute(query);

      if (res != undefined && res[0].Offer != null) {
        const Offer = JSON.parse("[" + res[0].Offer + "]");
        const AdvertiserID = Offer[0].Advertiser.AdvertiserID;
        const CampaignID = Offer[0].Campaign.CampaignID;

        blAdvertiser = await appsNames.getAppsNamesBLAdvertiser(AdvertiserID);
        blCampaign = await appsNames.getAppsNamesBLCampaign(CampaignID);

        wlAdvertiser = await appsNames.getAppsNamesWLAdvertiser(AdvertiserID);
        wlCampaign = await appsNames.getAppsNamesWLCampaign(CampaignID);

      }

      res.forEach(async item => {

        let temp = async (item) => {
          try {
            const offer = JSON.parse(_.get(item, 'Offer', {}));
            let OfferID = parseInt(_.get(item, 'OfferID', 0));
            blOffer = await appsNames.getAppsNamesBLOffer(OfferID);
            wlOffer = await appsNames.getAppsNamesWLOffer(OfferID);
            offer.WhiteList = wlOffer;
            offer.Campaign.WhiteList = wlCampaign;
            offer.Advertiser.WhiteList = wlAdvertiser;
            offer.BlackList = blOffer;
            offer.Campaign.BlackList = blCampaign;
            offer.Advertiser.BlackList = blAdvertiser;
            log( `Inserted/Update a document into the Offer ${OfferID}.`);
            return entityManager.oe.saveOffer(OfferID, offer);
          } catch (err) {
            throw `Error Inserted/Update a document into the Offer ${err}.`;
          }

        }
        promiseArray.push(temp(item));
      });

      Promise.all(promiseArray).then(function(){
        resolve({ status: 'campaigns_by_offers_updated'});
      });
      

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'offer_does_not_exist', error: error });
    }

  });
}
var registerOffersAll = function (params) {
  return new Promise(async (resolve, reject) => {
    
    const queryUpdateAll = query.CampaignsActive;
    const queryUpdate = query.offer;
    let blAdvertiser = [];
    let blCampaign = [];
    let blOffer = [];
    let wlAdvertiser = [];
    let wlCampaign = [];
    let wlOffer = [];
    let res;
    let query1;
    let promiseArray = [];
    let status;

    // Cnecto a SQL SERVER !
    //let connectionString=`mssql://${config.MSSQL_USER_NAME}:${config.MSSQL_PASSWORD}@${config.MSSQL_SERVER}/${config.MSSQL_DATABASE_NAME}?encrypt=true`;      
    //let conn = await sql.connect(connectionString)

    try {
      log('Add/Update Ofertas.');

      //let request = new sql.Request(conn);
      //let res1 = await request.query(queryUpdateAll);    
      //let res1 = await conn.request().query(queryUpdateAll)

      let res1 = await connector.execute( queryUpdateAll );
      const Campaigns = JSON.parse("[" + res1[0].Campaigns + "]"); //[{CampaignID: 47415}]; //
      let campaignid;
      
      Campaigns.forEach(async item1 => {
        params.campaignid = _.get(item1, 'CampaignID', 0);
        campaignid = _.get(item1, 'CampaignID', 0);
        //registerOffers(params);
        resultLogin = await asyncRequest(`https://click.laikad.com/offers?campaignid=${campaignid}`, [], "", "", "GET");
        log(resultLogin);

        /*campaignid = _.get(item1, 'CampaignID', 0);
        log( `Inserted/Update a document into the Offer ${campaignid}.`);
        query1 = queryUpdate.replace('__CAMPAIGN_ID__', campaignid);

        //var request = new sql.Request(conn);
        //res = await request.query(query1);   //connector.execute(query1);
        let res = await conn.request().query(query1, function (error, results, fields) {
          if (error) throw error;
          console.log('The solution is: ', results[0].solution);
        });
        
        if (res != undefined && res.recordset[0].Offer != null) {
          const Offer = JSON.parse("[" + res.recordset[0].Offer + "]");
          const AdvertiserID = Offer[0].Advertiser.AdvertiserID;
          const CampaignID = Offer[0].Campaign.CampaignID;

          //blAdvertiser = await appsNames.getAppsNamesBLAdvertiser(AdvertiserID);
          //blCampaign = await appsNames.getAppsNamesBLCampaign(CampaignID);

          //wlAdvertiser = await appsNames.getAppsNamesWLAdvertiser(AdvertiserID);
          //wlCampaign = await appsNames.getAppsNamesWLCampaign(CampaignID);
        }

        res.recordset.forEach(async item => {

          let temp = async (item) => {
            try {
              const offer = JSON.parse(_.get(item, 'Offer', {}));
              let OfferID = parseInt(_.get(item, 'OfferID', 0));
              //blOffer = await appsNames.getAppsNamesBLOffer(OfferID);
              //wlOffer = await appsNames.getAppsNamesWLOffer(OfferID);
              offer.WhiteList = wlOffer;
              offer.Campaign.WhiteList = wlCampaign;
              offer.Advertiser.WhiteList = wlAdvertiser;
              offer.BlackList = blOffer;
              offer.Campaign.BlackList = blCampaign;
              offer.Advertiser.BlackList = blAdvertiser;
              log( `Inserted/Update a document into the Offer ${OfferID}.`);
              return entityManager.oe.saveOffer(OfferID, offer);
            } catch (err) {
              throw `Error Inserted/Update a document into the Offer ${err}.`;
            }
          }
          promiseArray.push(temp(item));
        });
      });

      Promise.all(promiseArray).then(function(){
        resolve({ status: 'campaigns_by_offers_updated'});
      });*/
      
    })
    resolve({ status: status});

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'offer_does_not_exist', error: error });
    }

  });
}

var registerOffersCampaignsHead = function (params) {
  return new Promise(async (resolve, reject) => {
    const queryUpdate = query.CampaignHead;

    try {
      log('Update CampaignHead.');
      let promiseArray = [];
      const campaignheadid = params.campaignheadid;
      const query = queryUpdate.replace('__CAMPAIGN_HEAD_ID__', campaignheadid);
      results = await connector.execute(query);
      results.forEach(async item => {

        let temp = async (item) => {
          try {
            const campaignhead = JSON.parse(_.get(item, 'CampaignHead', {}));
            await entityManager.oe.saveOfferCampaignHead(campaignheadid, campaignhead);
            return `Update a document into the CampaignHead ${campaignheadid}.`;
          } catch (err) {
            throw `Error Update a document into the CampaignHead ${err}.`;
          }

        }
        promiseArray.push(temp(item));

      });

      Promise.all(promiseArray).then(resolve);
      resolve({ status: 'campaigns_by_offers_exists' });

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'offer_does_not_exist', error: error });
    }

  });
}

var registerOffersCampaigns = function (params) {
  return new Promise(async (resolve, reject) => {
    const queryUpdate = query.Campaign;

    try {
      log('Update Campaign.');
      let promiseArray = [];
      const campaignid = params.campaignid;
      const query = queryUpdate.replace('__CAMPAIGN_ID__', campaignid);
      results = await connector.execute(query);
      results.forEach(async item => {

        let temp = async (item) => {
          try {
            const campaign = JSON.parse(_.get(item, 'Campaign', {}));
            await entityManager.oe.saveOfferCampaign(campaignid, campaign);
            return `Update a document into the Campaign ${campaignid}.`;
          } catch (err) {
            throw `Error Update a document into the Campaign ${err}.`;
          }

        }
        promiseArray.push(temp(item));

      });

      Promise.all(promiseArray).then(resolve);
      resolve({ status: 'campaigns_by_offers_exists' });

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'campaigns_does_not_exist' });
    }

  });
}

var registerOffersAdvertisers = function (params) {
  return new Promise(async (resolve, reject) => {
    const queryUpdate = query.Advertiser;

    try {
      log('Update Advertiser.');
      let promiseArray = [];
      const advertiserid = parseInt(_.get(params, 'advertiserid', 0)); 
      const query = queryUpdate.replace('__ADVERTISER_ID__', advertiserid);
      results = await connector.execute(query);
      results.forEach(async item => {

        let temp = async (item) => {
          try {
            advertiser = JSON.parse(_.get(item, 'Advertiser', {}));
            await entityManager.oe.saveOfferAdvertiser(advertiserid, advertiser);
            return `Update a document into the Advertiser ${advertiserid}.`;
          } catch (err) {
            throw `Error Update a document into the Advertiser ${err}.`;
          }

        }
        promiseArray.push(temp(item));

      });

      Promise.all(promiseArray).then(resolve);
      resolve({ status: 'campaigns_by_offers_exists' });

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'offer_does_not_exist', error: error });
    }

  });
}

var registerOffersSuppliers = function (params) {
  return new Promise(async (resolve, reject) => {
    const queryUpdate = query.Supplier;

    try {
      log('Update Suppliers.');
      let promiseArray = [];
      const supplierid = params.supplierid;
      const query = queryUpdate.replace('__SUPPLIER_ID__', supplierid);
      results = await connector.execute(query);
      results.forEach(async item => {

        let temp = async (item) => {
          try {
            const supplier = JSON.parse(_.get(item, 'Supplier', {}));
            await entityManager.oe.saveOfferSupplier(supplierid, supplier);
            return `Update a document into the Supplier ${supplierid}.`;
          } catch (err) {
            throw `Error Update a document into the Supplier ${err}.`;
          }

        }
        promiseArray.push(temp(item));

      });

      Promise.all(promiseArray).then(resolve);
      resolve({ status: 'campaigns_by_offers_exists' });

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'offer_does_not_exist', error: error });
    }

  });
}

var registerAdvertiserPrePay = function (params) {
}

module.exports = {
  registerOffers: registerOffers,
  registerOffersAll: registerOffersAll,
  registerOffersGuid: registerOffersGuid,
  registerOffersCampaignsHead: registerOffersCampaignsHead,
  registerOffersCampaigns: registerOffersCampaigns,
  registerOffersAdvertisers: registerOffersAdvertisers,
  registerOffersSuppliers: registerOffersSuppliers,
  registerAdvertiserPrePay: registerAdvertiserPrePay
}