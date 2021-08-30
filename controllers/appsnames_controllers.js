var log = require("../modules/log");
const db = require("../modules/db");

var registerAppsNamesWhiteListCampaign = function (params) {
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const CampaignID = params.campaignid;
      let WhiteList = await getAppsNamesWLCampaign( CampaignID );

      if (WhiteList.length>0) {
        db.connection().collection(collection).updateMany(
          { "Campaign.CampaignID": CampaignID },
          {
            $set: {
              "Campaign.WhiteList": WhiteList,
            }
          },
          { upsert: false }
        )
          .then(
            function (result) {
              resolve(`Update a document into the Campaign ${result.matchedCount}.`);
            }
          )
          .catch(
            function (err) {
              log(err);
              reject(`Error Update  a document into the Campaign ${err}.`);
            }
          );
      } else {
        log(' WhiteList Inexistentes');
        reject(`Error Update not found.`);
      }
    } catch (error) {
      log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}

var registerAppsNamesWhiteListAdvertiser = function (params) {
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const AdvertiserID = params.advertiserid;
      let WhiteList = await getAppsNamesWLAdvertiser( AdvertiserID );

      if (WhiteList.length>0) {
        db.connection().collection(collection).updateMany(
          { "Advertiser.AdvertiserID": AdvertiserID },
          {
            $set: {
              "Advertiser.WhiteList": WhiteList,
            }
          },
          { upsert: false }
        )
          .then(
            function (result) {
              resolve(`Update a document into the Campaign ${result.matchedCount}.`);
            }
          )
          .catch(
            function (err) {
              log(err);
              reject(`Error Update  a document into the Campaign ${err}.`);
            }
          );
      } else {
        log(' WhiteList Inexistentes');
        reject(`Error Update not found.`);
      }
    } catch (error) {
      log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}

var registerAppsNamesWhiteListOffer = function (params) {
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const OfferID = params.offerid;
      let WhiteList = await getAppsNamesWLOffer( OfferID );

      if (WhiteList.length>0) {
        db.connection().collection(collection).updateMany(
          { "OfferID": OfferID },
          {
            $set: {
              "WhiteList": WhiteList,
            }
          },
          { upsert: false }
        )
          .then(
            function (result) {
              resolve(`Update a document into the Offer ${result.matchedCount}.`);
            }
          )
          .catch(
            function (err) {
              log(err);
              reject(`Error Update  a document into the Offer ${err}.`);
            }
          );
      } else {
        log(' WhiteList Inexistentes');
        reject(`Error Update not found.`);
      }
    } catch (error) {
      log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}

var registerAppsNamesBlackListCampaign = function (params) {
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const CampaignID = params.campaignid;
      let BlackList = await getAppsNamesBLCampaign( CampaignID );

      if (BlackList.length>0) {
        db.connection().collection(collection).updateMany(
          { "Campaign.CampaignID": CampaignID },
          {
            $set: {
              "Campaign.BlackList": BlackList,
            }
          },
          { upsert: false }
        )
          .then(
            function (result) {
              resolve(`Update a document into the Campaign ${result.matchedCount}.`);
            }
          )
          .catch(
            function (err) {
              log(err);
              reject(`Error Update  a document into the Campaign ${err}.`);
            }
          );
      } else {
        log(' BlackList Inexistentes');
        reject(`Error Update not found.`);
      }
    } catch (error) {
      log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}

var registerAppsNamesBlackListAdvertiser = function (params) {
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const AdvertiserID = params.advertiserid;
      let BlackList = await getAppsNamesBLAdvertiser( AdvertiserID );

      if (BlackList.length>0) {
        db.connection().collection(collection).updateMany(
          { "Advertiser.AdvertiserID": AdvertiserID },
          {
            $set: {
              "Advertiser.BlackList": BlackList,
            }
          },
          { upsert: false }
        )
          .then(
            function (result) {
              resolve(`Update a document into the Campaign ${result.matchedCount}.`);
            }
          )
          .catch(
            function (err) {
              log(err);
              reject(`Error Update  a document into the Campaign ${err}.`);
            }
          );
      } else {
        log(' BlackList Inexistentes');
        reject(`Error Update not found.`);
      }
    } catch (error) {
      log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}

var registerAppsNamesBlackListOffer = function (params) {
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const OfferID = params.offerid;
      let BlackList = await getAppsNamesBLOffer( OfferID );

      if (BlackList.length>0) {
        db.connection().collection(collection).updateMany(
          { "OfferID": OfferID },
          {
            $set: {
              "BlackList": BlackList,
            }
          },
          { upsert: false }
        )
          .then(
            function (result) {
              resolve(`Update a document into the Offer ${result.matchedCount}.`);
            }
          )
          .catch(
            function (err) {
              log(err);
              reject(`Error Update a document into the Offer ${err}.`);
            }
          );
      } else {
        log(' BlackList Inexistentes');
        reject(`Error Update not found.`);
      }
    } catch (error) {
      log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}

module.exports = {
  registerAppsNamesWhiteListOffer: registerAppsNamesWhiteListOffer,
  registerAppsNamesWhiteListCampaign: registerAppsNamesWhiteListCampaign,
  registerAppsNamesWhiteListAdvertiser: registerAppsNamesWhiteListAdvertiser,
  registerAppsNamesBlackListOffer: registerAppsNamesBlackListOffer,
  registerAppsNamesBlackListCampaign: registerAppsNamesBlackListCampaign,
  registerAppsNamesBlackListAdvertiser: registerAppsNamesBlackListAdvertiser,
}