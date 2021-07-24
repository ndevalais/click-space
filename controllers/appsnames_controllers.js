var log = require("../modules/log");
const connector = require("../modules/db_sql/connector2");
const db = require("../modules/db");

var registerAppsNames = function (params) {

  return new Promise(async (resolve, reject) => {    
    const db = require("../modules/db");
    const collection = 'AppsNames';
    const ObjectID = require('mongodb').ObjectID;

    console.log(params.offerid);
    const queryUpdate = `
    SELECT (
      SELECT 
        AN.CountryCode AS [CountryCode], 
        AN.Device AS [Device], 
        AN.AppNameID AS [AppNameID], 
        AN.AppName AS [AppName], 
        AN.AppID AS [AppID]
      FROM AppsNames AN 
      WHERE AN.Processed = 1 AND AN.CountryCode = '__COUNTRY_CODE__'
      FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
      ) AppsNames `; // 
    // --AND AN.Device = '__DEVICE__' --AND AN.AppNameID = 1514 AN.CountryCode = '__COUNTRY_CODE__' AND
    try {
      const CountryCode = params.countrycode;
      const Device = params.device;
      const query = queryUpdate.replace('__COUNTRY_CODE__', CountryCode).replace('__DEVICE__', Device);

      results = await connector.execute(query);
      if (results != undefined && results.length >= 0) {
        const appsnames = JSON.parse("[" + results[0].AppsNames + "]");

        await db.connection().collection(collection).deleteMany({ CountryCode: CountryCode });

        await db.connection().collection(collection).insertMany(appsnames)
          .then(
            function (result) {
              resolve(`Inserted/Update a document into the Offert ${result}.`);
            }
          )
          .catch(
            function (err) {
              console.log(err);
              reject(`Error Inserted/Update  a document into the Offert ${err}.`);
            }
          );

      }

    } catch (error) {
      console.log(`Error ${error} rows`);
    }
  });
}

/**
 * AppsNames WhiteList
 */
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

async function getAppsNamesWLCampaign( CampaignID ) {
  let WhiteList = []; 

  try {
    const queryUpdate = `
    SELECT (
      SELECT 
        AN.AppNameID AS [AppNameID], 	
        AN.CountryCode AS [CountryCode], 
        AN.Device AS [Device],
        AN.AppName AS [AppName], 
        AN.AppID AS [AppID]
        --,BL2.CampaignID AS [WhiteList.Campaigns.CampaignID]
      FROM AppsNames AN 
        JOIN BlackList BL2 ON AN.AppNameID = BL2.SubPubID AND	BL2.StatusID = 'A' AND (BL2.ListType = 'AW' ) AND BL2.OfferID IS NULL AND BL2.CampaignID IS NOT NULL AND BL2.AdvertiserID IS NULL
      WHERE AN.Processed = 1 AND BL2.CampaignID =   __CAMPAIGN_ID__
      ORDER BY AN.AppNameID
      FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
      ) WhiteList`;
    
    // WhiteList Campaign
    let query = queryUpdate.replace('__CAMPAIGN_ID__', CampaignID);
    results = await connector.execute(query);
    if (results != undefined && results[0].WhiteList != null) {
      WhiteList = JSON.parse("[" + results[0].WhiteList + "]");
    }
    return WhiteList;
  } catch (error) {
    log(`Error ${error} rows`);
    return WhiteList;
  }
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

async function getAppsNamesWLAdvertiser( AdvertiserID ) {
  let WhiteList = []; 

  try {
    const queryUpdate = `
    SELECT (
      SELECT 
        AN.AppNameID AS [AppNameID], 	
        AN.CountryCode AS [CountryCode], 
        AN.Device AS [Device],
        AN.AppName AS [AppName], 
        AN.AppID AS [AppID]
        --BL3.AdvertiserID AS [WhiteList.Advertisers.AdvertiserID]
      FROM AppsNames AN 
        JOIN BlackList BL3 ON AN.AppNameID = BL3.SubPubID AND	BL3.StatusID = 'A' AND (BL3.ListType = 'AW' ) AND BL3.OfferID IS NULL AND BL3.CampaignID IS NULL AND BL3.AdvertiserID IS NOT NULL
      WHERE AN.Processed = 1 AND BL3.AdvertiserID = __ADVERTISER_ID__
      ORDER BY AN.AppNameID
      FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
      ) WhiteList `;
    
    // WhiteList Campaign
    let query = queryUpdate.replace('__ADVERTISER_ID__', AdvertiserID);
    results = await connector.execute(query);
    if (results != undefined && results[0].WhiteList != null) {
      WhiteList = JSON.parse("[" + results[0].WhiteList + "]");
    }
    return WhiteList;
  } catch (error) {
    log(`Error ${error} rows`);
    return WhiteList;
  }
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

async function getAppsNamesWLOffer( OfferID ) {
  let WhiteList = []; 

  try {
    const queryUpdate = `
    SELECT (
        SELECT 
          AN.AppNameID AS [AppNameID], 	
          AN.CountryCode AS [CountryCode], 
          AN.Device AS [Device],
          AN.AppName AS [AppName], 
          AN.AppID AS [AppID]
          --,BL1.OfferID AS [WhiteList.Offer.OfferID]
        FROM AppsNames AN 
          JOIN BlackList BL1 ON AN.AppNameID = BL1.SubPubID AND	BL1.StatusID = 'A' AND (BL1.ListType = 'AW' ) AND BL1.OfferID IS NOT NULL AND BL1.CampaignID IS NULL AND BL1.AdvertiserID IS NULL
        WHERE AN.Processed = 1 AND BL1.OfferID = __OFFER_ID__
        ORDER BY AN.AppNameID
      FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
      ) WhiteList `;
    
    // WhiteList Campaign
    let query = queryUpdate.replace('__OFFER_ID__', OfferID);
    results = await connector.execute(query);
    if (results != undefined && results[0].WhiteList != null) {
      WhiteList = JSON.parse("[" + results[0].WhiteList + "]");
    }
    return WhiteList;
  } catch (error) {
    log(`Error ${error} rows`);
    return WhiteList;
  }
}

var registerAppsNamesWhiteList = function (params) {

  return new Promise(async (resolve, reject) => {    
    const db = require("../modules/db");
    const collection = 'Offers';
    const ObjectID = require('mongodb').ObjectID;
    let lOK = true;

    log(params.offerid);
    const queryUpdate1 = `
      SELECT (
        SELECT 
          AN.AppNameID AS [AppNameID], 	
          AN.CountryCode AS [CountryCode], 
          AN.Device AS [Device],
          AN.AppName AS [AppName], 
          AN.AppID AS [AppID]
          --,BL1.OfferID AS [WhiteList.Offer.OfferID]
        FROM AppsNames AN 
          JOIN BlackList BL1 ON AN.AppNameID = BL1.SubPubID AND	BL1.StatusID = 'A' AND (BL1.ListType = 'AW' ) AND BL1.OfferID IS NOT NULL AND BL1.CampaignID IS NULL AND BL1.AdvertiserID IS NULL
        WHERE AN.Processed = 1 AND BL1.OfferID = __OFFER_ID__
        ORDER BY AN.AppNameID
        FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
        ) WhiteList `;

    const queryUpdate2 = `
        SELECT (
          SELECT 
            AN.AppNameID AS [AppNameID], 	
            AN.CountryCode AS [CountryCode], 
            AN.Device AS [Device],
            AN.AppName AS [AppName], 
            AN.AppID AS [AppID]
            --,BL2.CampaignID AS [WhiteList.Campaigns.CampaignID]
          FROM AppsNames AN 
            JOIN BlackList BL2 ON AN.AppNameID = BL2.SubPubID AND	BL2.StatusID = 'A' AND (BL2.ListType = 'AW' ) AND BL2.OfferID IS NULL AND BL2.CampaignID IS NOT NULL AND BL2.AdvertiserID IS NULL
          WHERE AN.Processed = 1 AND BL2.CampaignID = (select CampaignID from Offers where OfferID = __OFFER_ID__)
          ORDER BY AN.AppNameID
          FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
          ) WhiteList`;

    const queryUpdate3 = `
        SELECT (
          SELECT 
            AN.AppNameID AS [AppNameID], 	
            AN.CountryCode AS [CountryCode], 
            AN.Device AS [Device],
            AN.AppName AS [AppName], 
            AN.AppID AS [AppID]
            --BL3.AdvertiserID AS [WhiteList.Advertisers.AdvertiserID]
          FROM AppsNames AN 
            JOIN BlackList BL3 ON AN.AppNameID = BL3.SubPubID AND	BL3.StatusID = 'A' AND (BL3.ListType = 'AW' ) AND BL3.OfferID IS NULL AND BL3.CampaignID IS NULL AND BL3.AdvertiserID IS NOT NULL
          WHERE AN.Processed = 1 AND BL3.AdvertiserID = (select AdvertiserID from Offers JOIN Campaigns ON Offers.CampaignID = Campaigns.CampaignID WHERE OfferID = __OFFER_ID__)
          ORDER BY AN.AppNameID
          FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
          ) WhiteList `;

    try {
      const OfferID = params.offerid;
      let WhiteListO = [];
      let WhiteListC = [];
      let WhiteListA = [];

      // WhiteList Offers
      let query = queryUpdate1.replace('__OFFER_ID__', OfferID);
      results = await connector.execute(query);
      if (results != undefined && results[0].WhiteList != null) {
        WhiteListO = JSON.parse("[" + results[0].WhiteList + "]");
      }
      // WhiteList Campaign
      query = queryUpdate2.replace('__OFFER_ID__', OfferID);
      results = await connector.execute(query);
      if (results != undefined && results[0].WhiteList != null) {
        WhiteListC = JSON.parse("[" + results[0].WhiteList + "]");
      }
      // WhiteList Campaign
      query = queryUpdate3.replace('__OFFER_ID__', OfferID);
      results = await connector.execute(query);
      if (results != undefined && results[0].WhiteList != null) {
        WhiteListA = JSON.parse("[" + results[0].WhiteList + "]");
      }

      if (lOK) {
        db.connection().collection(collection).updateOne(
          { "OfferID": OfferID },
          {
            $set: {
              "WhiteList": WhiteListO,
              "Campaign.WhiteList": WhiteListC,
              "Advertiser.WhiteList": WhiteListA
            }
          }
        )
          .then(
            function (result) {
              resolve(`Inserted/Update a document into the Offert ${result}.`);
            }
          )
          .catch(
            function (err) {
              console.log(err);
              reject(`Error Inserted/Update  a document into the Offert ${err}.`);
            }
          );
      } else {
        console.log(' WhiteList Inexistentes');
        reject(`Error Inserted/Update not found ${err}.`);
      }
    } catch (error) {
      console.log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}

/**
 * AppsNames BlackList
 */
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

async function getAppsNamesBLCampaign( CampaignID ) {
  let BlackList = []; 

  try {
    const queryUpdate = `
    SELECT (
      SELECT 
        AN.AppNameID AS [AppNameID], 	
        AN.CountryCode AS [CountryCode], 
        AN.Device AS [Device],
        AN.AppName AS [AppName], 
        AN.AppID AS [AppID]
        --,BL2.CampaignID AS [BlackList.Campaigns.CampaignID]
      FROM AppsNames AN 
        JOIN BlackList BL5 ON AN.AppNameID = BL5.SubPubID AND	BL5.StatusID = 'A' AND (BL5.ListType = 'AB' ) AND BL5.OfferID IS NULL AND BL5.CampaignID IS NOT NULL AND BL5.AdvertiserID IS NULL
      WHERE AN.Processed = 1 AND BL5.CampaignID = __CAMPAIGN_ID__
      ORDER BY AN.AppNameID
      FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
      ) BlackList`;
    
    // BlackList Campaign
    let query = queryUpdate.replace('__CAMPAIGN_ID__', CampaignID);
    results = await connector.execute(query);
    if (results != undefined && results[0].BlackList != null) {
      BlackList = JSON.parse("[" + results[0].BlackList + "]");
    }
    return BlackList;
  } catch (error) {
    log(`Error ${error} rows`);
    return BlackList;
  }
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

async function getAppsNamesBLAdvertiser( AdvertiserID ) {
  let BlackList = []; 

  try {
    const queryUpdate =  `
    SELECT (
      SELECT 
        AN.AppNameID AS [AppNameID], 	
        AN.CountryCode AS [CountryCode], 
        AN.Device AS [Device],
        AN.AppName AS [AppName], 
        AN.AppID AS [AppID]
        --BL3.AdvertiserID AS [BlackList.Advertisers.AdvertiserID]
      FROM AppsNames AN 
      JOIN BlackList BL6 ON AN.AppNameID = BL6.SubPubID AND	BL6.StatusID = 'A' AND (BL6.ListType = 'AB' ) AND BL6.OfferID IS NULL AND BL6.CampaignID IS NULL AND BL6.AdvertiserID IS NOT NULL
      WHERE AN.Processed = 1 AND BL6.AdvertiserID = __ADVERTISER_ID__
      ORDER BY AN.AppNameID
      FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
      ) BlackList `;
    
    // BlackList Campaign
    let query = queryUpdate.replace('__ADVERTISER_ID__', AdvertiserID);
    results = await connector.execute(query);
    if (results != undefined && results[0].BlackList != null) {
      BlackList = JSON.parse("[" + results[0].BlackList + "]");
    }
    return BlackList;
  } catch (error) {
    log(`Error ${error} rows`);
    return WhiteList;
  }
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

async function getAppsNamesBLOffer( OfferID ) {
  let BlackList = []; 

  try {
    const queryUpdate = `
    SELECT (
      SELECT 
        AN.AppNameID AS [AppNameID], 	
        AN.CountryCode AS [CountryCode], 
        AN.Device AS [Device],
        AN.AppName AS [AppName], 
        AN.AppID AS [AppID]
        --BL4.OfferID AS [BlackList.Offer.OfferID]
      FROM AppsNames AN 
        JOIN BlackList BL4 ON AN.AppNameID = BL4.SubPubID AND	BL4.StatusID = 'A' AND (BL4.ListType = 'AB' ) AND BL4.OfferID IS NOT NULL AND BL4.CampaignID IS NULL AND BL4.AdvertiserID IS NULL
      WHERE AN.Processed = 1 AND BL4.OfferID = __OFFER_ID__
      ORDER BY AN.AppNameID
      FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
      ) BlackList `;
    
    // BlackList Campaign
    let query = queryUpdate.replace('__OFFER_ID__', OfferID);
    results = await connector.execute(query);
    if (results != undefined && results[0].BlackList != null) {
      BlackList = JSON.parse("[" + results[0].BlackList + "]");
    }
    return BlackList;
  } catch (error) {
    log(`Error ${error} rows`);
    return BlackList;
  }
}

var registerAppsNamesBlackList = function (params) {

  return new Promise(async (resolve, reject) => {    
    const db = require("../modules/db");
    const collection = 'Offers';
    const ObjectID = require('mongodb').ObjectID;
    let lOK = true;

    console.log(params.offerid);
    const queryUpdate1 = `
      SELECT (
        SELECT 
          AN.AppNameID AS [AppNameID], 	
          AN.CountryCode AS [CountryCode], 
          AN.Device AS [Device],
          AN.AppName AS [AppName], 
          AN.AppID AS [AppID]
          --BL4.OfferID AS [BlackList.Offer.OfferID]
        FROM AppsNames AN 
          JOIN BlackList BL4 ON AN.AppNameID = BL4.SubPubID AND	BL4.StatusID = 'A' AND (BL4.ListType = 'AB' ) AND BL4.OfferID IS NOT NULL AND BL4.CampaignID IS NULL AND BL4.AdvertiserID IS NULL
        WHERE AN.Processed = 1 AND BL4.OfferID = __OFFER_ID__
        ORDER BY AN.AppNameID
        FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
        ) BlackList `;

    const queryUpdate2 = `
        SELECT (
          SELECT 
            AN.AppNameID AS [AppNameID], 	
            AN.CountryCode AS [CountryCode], 
            AN.Device AS [Device],
            AN.AppName AS [AppName], 
            AN.AppID AS [AppID]
            --,BL2.CampaignID AS [BlackList.Campaigns.CampaignID]
          FROM AppsNames AN 
            JOIN BlackList BL5 ON AN.AppNameID = BL5.SubPubID AND	BL5.StatusID = 'A' AND (BL5.ListType = 'AB' ) AND BL5.OfferID IS NULL AND BL5.CampaignID IS NOT NULL AND BL5.AdvertiserID IS NULL
          WHERE AN.Processed = 1 AND BL5.CampaignID = (select CampaignID from Offers where OfferID = __OFFER_ID__)
          ORDER BY AN.AppNameID
          FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
          ) BlackList`;

    const queryUpdate3 = `
        SELECT (
          SELECT 
            AN.AppNameID AS [AppNameID], 	
            AN.CountryCode AS [CountryCode], 
            AN.Device AS [Device],
            AN.AppName AS [AppName], 
            AN.AppID AS [AppID]
            --BL3.AdvertiserID AS [BlackList.Advertisers.AdvertiserID]
          FROM AppsNames AN 
          JOIN BlackList BL6 ON AN.AppNameID = BL6.SubPubID AND	BL6.StatusID = 'A' AND (BL6.ListType = 'AB' ) AND BL6.OfferID IS NULL AND BL6.CampaignID IS NULL AND BL6.AdvertiserID IS NOT NULL
          WHERE AN.Processed = 1 AND BL6.AdvertiserID = (select AdvertiserID from Offers JOIN Campaigns ON Offers.CampaignID = Campaigns.CampaignID WHERE OfferID = __OFFER_ID__)
          ORDER BY AN.AppNameID
          FOR JSON PATH , WITHOUT_ARRAY_WRAPPER
          ) BlackList `;

    try {
      const OfferID = params.offerid;
      let BlackListO = [];
      let BlackListC = [];
      let BlackListA = [];

      // BlackList Offers
      let query = queryUpdate1.replace('__OFFER_ID__', OfferID);
      results = await connector.execute(query);
      if (results != undefined && results[0].BlackList != null) {
        BlackListO = JSON.parse("[" + results[0].BlackList + "]");
      }
      // BlackList Campaign
      query = queryUpdate2.replace('__OFFER_ID__', OfferID);
      results = await connector.execute(query);
      if (results != undefined && results[0].BlackList != null) {
        BlackListC = JSON.parse("[" + results[0].BlackList + "]");
      }
      // BlackList Campaign
      query = queryUpdate3.replace('__OFFER_ID__', OfferID);
      results = await connector.execute(query);
      if (results != undefined && results[0].BlackList != null) {
        BlackListA = JSON.parse("[" + results[0].BlackList + "]");
      }

      if (lOK) {
        db.connection().collection(collection).updateOne(
          { "OfferID": OfferID },
          {
            $set: {
              "BlackList": BlackListO,
              "Campaign.BlackList": BlackListC,
              "Advertiser.BlackList": BlackListA
            }
          }
        )
          .then(
            function (result) {
              resolve(`Inserted/Update a document into the Offert ${result}.`);
            }
          )
          .catch(
            function (err) {
              console.log(err);
              reject(`Error Inserted/Update  a document into the Offert ${err}.`);
            }
          );
      } else {
        console.log(' BlackList Inexistentes');
        reject(`Error Inserted/Update not found ${err}.`);
      }
    } catch (error) {
      console.log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}

module.exports = {
  registerAppsNames: registerAppsNames,
  registerAppsNamesWhiteListOffer: registerAppsNamesWhiteListOffer,
  registerAppsNamesWhiteListCampaign: registerAppsNamesWhiteListCampaign,
  registerAppsNamesWhiteListAdvertiser: registerAppsNamesWhiteListAdvertiser,
  getAppsNamesWLOffer: getAppsNamesWLOffer,
  getAppsNamesWLCampaign: getAppsNamesWLCampaign,
  getAppsNamesWLAdvertiser: getAppsNamesWLAdvertiser,
  registerAppsNamesBlackListOffer: registerAppsNamesBlackListOffer,
  registerAppsNamesBlackListCampaign: registerAppsNamesBlackListCampaign,
  registerAppsNamesBlackListAdvertiser: registerAppsNamesBlackListAdvertiser,
  getAppsNamesBLOffer: getAppsNamesBLOffer,
  getAppsNamesBLCampaign: getAppsNamesBLCampaign,
  getAppsNamesBLAdvertiser: getAppsNamesBLAdvertiser
}