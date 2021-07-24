var log = require("../modules/log")
//const c = require('../modules/constants');
var _ = require('lodash');
var connector = require("../modules/db_sql/connector2");
var db = require("../modules/db");
var entityBlackList = require('../modules/entity_manager/blacklist_entity');
var entityOffers = require('../modules/entity_manager/offer_entity');
// = require('../modules/entity_manager/users_entity');
const { roughSizeOfObject } = require('../modules/tools/index');
const { result } = require("lodash");

var getBlacklist = function (params) {
  return new Promise(async (resolve, reject) => {
    try {
      const AccessToken = _.get(params, "http_token_auth", "");
      var CampaignID = _.get(params, "campaignid", null);
      var AdvertiserID = _.get(params, "advertiserid", null);
      var SupplierID = _.get(params, "supplierid", null);
      var OfferID = _.get(params, "offerid", null);
      //var StatusID = _.get(params, "statusid");
      var ListType = _.get(params, "listtype");
      var AllOffers = _.get(params, "alloffers", 0);
      var temp = [];
      var temp0 = [];
      var temp1 = [];
      var temp2 = [];
      var arrOffers = [];
      let timeInitial = Date.now();
      let timeTotal = 0;

      // Valido si debo mostrar todas las BlackList
      if (AllOffers) {

        // Obtengo todas las BL de las OFERTAS
        if (OfferID != null && OfferID != "") {
          // Obtengo todas las Ofertas
          OfferID = parseInt(OfferID);
          temp = await entityBlackList.getBlackListOffer(ListType, OfferID);
        } else if (CampaignID != null && CampaignID != "") {
          // Obtengo todas las BL de las CAMPAS
          CampaignID = parseInt(CampaignID);
          AdvertiserID = parseInt(AdvertiserID);
          arrOffers = await entityOffers.getOffersCampaignID(CampaignID);
          temp0 = await entityBlackList.getBlackListAdvertiser(ListType, AdvertiserID);
          if (arrOffers.length>0) {
            temp1 = await entityBlackList.getBlackListCampaign(ListType, [CampaignID]);
            temp2 = await entityBlackList.getBlackListOffers(ListType, arrOffers);
          }

        } else if (AdvertiserID != null && AdvertiserID != "") {
          // Obtengo todas las BL del ADVERTISER
          AdvertiserID = parseInt(AdvertiserID);
          arrCampaigns = await entityOffers.getCampaignsAdvertiserID(AdvertiserID)
          arrOffers = await entityOffers.getOffersIDAdvertiser(AdvertiserID);
          temp0 = await entityBlackList.getBlackListAdvertiser(ListType, AdvertiserID);
          if (arrOffers.length>0) {
            temp1 = await entityBlackList.getBlackListCampaign(ListType, arrCampaigns );
            temp2 = await entityBlackList.getBlackListOffers(ListType, arrOffers); 
          }
        } else if (SupplierID != null && SupplierID != "") {
            SupplierID = parseInt(SupplierID);
            temp0 = await entityBlackList.getBlackListSupplier(ListType, SupplierID);
        }

        // Debo concatenar los temps !!
        temp = temp0;
        for (var i = 0; i < temp1.length; i++) {
          temp.push(temp1[i]);
        }
        for (var i = 0; i < temp2.length; i++) {
          temp.push(temp2[i]);
        }

      } else {
        // Valido si se ingreso por OfferID. sino por CampaignID y si no por AdvertiserID
        if (OfferID != null && OfferID != "") {
          OfferID = parseInt(OfferID);
          temp = await entityBlackList.getBlackListOffer(ListType, OfferID);
        } else if (CampaignID != null && CampaignID != "") {
          CampaignID = parseInt(CampaignID);
          temp = await entityBlackList.getBlackListCampaign(ListType, [CampaignID]);
        } else if (AdvertiserID != null && AdvertiserID != "") {
          AdvertiserID = parseInt(AdvertiserID);
          temp = await entityBlackList.getBlackListAdvertiser(ListType, AdvertiserID);
        } else  if (SupplierID != null && SupplierID != "") {
          SupplierID = parseInt(SupplierID);
          temp = await entityBlackList.getBlackListSupplier(ListType, SupplierID);
        }
      }

      // Obtengo registros totales
      let total = temp.length;

      // Obtengo size de la consulta y lo paso a kb
      let totalSize = await roughSizeOfObject(temp);
      totalSize = (totalSize)/1000;
      timeTotal = (Date.now() - timeInitial )/1000;

      resolve({ status: 'BlackList_get', write_output: true, result: temp, total: total, time: timeTotal, size: totalSize });

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'BlackList_does_not_exist', error: error });
    }
  });
}

var createUpdateBlacklist = function (params) {

  return new Promise(async (resolve, reject) => {
    var CampaignID = _.get(params, "campaignid", null);
    var AdvertiserID = _.get(params, "advertiserid", null);
    var SupplierID = _.get(params, "supplierid", null);
    var OfferID = _.get(params, "offerid", null);
    var SubPubID = _.get(params, "subpubid");
    var StatusID = _.get(params, "statusid");
    var ListType = _.get(params, "listtype");
    var promiseArray = [];
    var status = true;

    try {
      SubPubID = SubPubID.split(',');
      if (StatusID != 'A') status = false;
      if (AdvertiserID != null && AdvertiserID != "") {
        AdvertiserID = parseInt(AdvertiserID);
      } else {
        AdvertiserID = null;
      }
      if (CampaignID != null && CampaignID != "") {
        CampaignID = parseInt(CampaignID);
      } else {
        CampaignID = null;
      }
      if (OfferID != null && OfferID != "") {
        OfferID = parseInt(OfferID);
      } else {
        OfferID = null;
      }
      if (SupplierID != null && SupplierID != "") {
        SupplierID = parseInt(SupplierID);
      } else {
        SupplierID = null;
      }

      for (var i = 0; i < SubPubID.length; i++) {
        let temp = async (ListType, SubPubID, AdvertiserID, CampaignID, OfferID, status) => {
          try {
            await entityBlackList.saveBlackList(ListType, SubPubID, AdvertiserID, CampaignID, OfferID, SupplierID, status);
            log(`Inserted/Update a document into the Blacklist ${SubPubID}.`);
            return `Inserted/Update a document into the Blacklist ${SubPubID}.`;
          } catch (err) {
            throw `Error Inserted/Update a document into the Blacklist ${err}.`;
          }
        }

        promiseArray.push(temp(ListType, SubPubID[i], AdvertiserID, CampaignID, OfferID, status));

      };
      Promise.all(promiseArray).then(function () {
        resolve({ status: 'BlackList_create_updated', write_output: true });
      });

      //resolve({ status: 'BlackList_create_updated', write_output: true, result: true });

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'BlackList_create_updated', write_output: true, result: error });
    }
  });

}

var deleteBlacklist = function (params) {

  return new Promise(async (resolve, reject) => {
    var CampaignID = _.get(params, "campaignid", null);
    var AdvertiserID = _.get(params, "advertiserid", null);
    var OfferID = _.get(params, "offerid", null);
    var SubPubID = _.get(params, "subpubid");
    var StatusID = _.get(params, "statusid");
    var ListType = _.get(params, "listtype");
    var Status = _.get(params, "status", 0);
    var Action = _.get(params, "action");
    var IDs = _.get(params, "blacklistid", ''); //
    var promiseArray = [];
    var status = true;
    var retorno;
    var resultado = [];
    if (Status==0) Status = false;
    if (Status==1) Status = true;

    try {
      if (IDs!='') IDs = IDs.split(',');
      if (StatusID != 'A') status = false;
      if (AdvertiserID != null && AdvertiserID != "") {
        AdvertiserID = parseInt(AdvertiserID);
      } else {
        AdvertiserID = null;
      }
      if (CampaignID != null && CampaignID != "") {
        CampaignID = parseInt(CampaignID);
      } else {
        CampaignID = null;
      }
      if (OfferID != null && OfferID != "") {
        OfferID = parseInt(OfferID);
      } else {
        OfferID = null;
      }

      if (IDs=='') {
        // Elimino BLACKLIST por SubPub
        for (var i = 0; i < SubPubID.length; i++) {
          let temp = async (ListType, SubPubID, AdvertiserID, CampaignID, OfferID) => {
            try {
              
              await entityBlackList.delBlackList(ListType, SubPubID, AdvertiserID, CampaignID, OfferID);

              log(`Delete a document into the Blacklist ${SubPubID}.`);
              return `Delete a document into the Blacklist ${SubPubID}.`;
            } catch (err) {
              throw `Error Delete a document into the Blacklist ${err}.`;
            }
          }
        
          promiseArray.push(temp(ListType, SubPubID[i], AdvertiserID, CampaignID, OfferID));
        };

        Promise.all(promiseArray).then(function () {
          resolve({ status: 'BlackList_create_updated', write_output: true });
        });

      } else {
        for (var i = 0; i < IDs.length; i++) {
          let temp = async (id) => {
            try {
              if (Action=='DELETE') {
                retorno = await entityBlackList.delBlackListID(id);
                resultado.push( { id, delete: retorno.deletedCount } );
              } else {
                retorno = await entityBlackList.pauseBlackListID(id, Status);
                resultado.push( { id, pause: retorno.modifiedCount } );
              }
              log(`${Action} a document into the Blacklist ${id}.`); // 
              return `${Action} a document into the Blacklist ${id}.`;
            } catch (err) {
              throw `Error ${Action} a document into the Blacklist ${err}.`;
            }
          }

          promiseArray.push(temp( IDs[i] ));
        }

        Promise.all(promiseArray).then(function () {
          resolve({ status: 'BlackList_delete_pause', write_output: true, result: resultado });
        });
      }

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'BlackList_create_updated', write_output: true, result: error });
    }
  });
}

var registerBlacklist = function (params) {
  return new Promise(async (resolve, reject) => {
    const collection = 'Blacklist';
    const ObjectID = require('mongodb').ObjectID;

    //log(params.offerid);
    const queryUpdate = `SELECT 
      BL.BlackListID AS [id]
      ,CASE BL.ListType 
        WHEN 'BL' THEN 'BlackList' 
        WHEN 'WL' THEN 'WhiteList' 
        WHEN 'AW' THEN 'AppsNames WL' 
        ELSE '' END AS [ListType]
      ,BL.ListType AS [ListTypeID]
      ,BL.SubPubID AS [SubPubID]
      ,BL.AdvertiserID AS [AdvertiserID]
      ,BL.CampaignID AS [CampaignID]
      ,BL.OfferID AS [OfferID]
      ,BL.isIP AS [isIP]
      ,BL.DateFrom AS [DateFrom]
      ,BL.DateTo AS [DateTo]
      ,BL.ControlIP AS [ControlIP]
      ,BL.StatusID AS [StatusID]
      ,T.[Description] AS [Status]
      ,ISNULL(USR.Name,'') AS [CreateAccountManager]
      ,BL.CreationDate AS [CreateCreationDate]
      ,ISNULL(USRS.Name,'') AS [UpdateAccountManager]
      ,BL.UpdateDate AS [UpdateUpdateDate]
    FROM BlackList BL JOIN Types T ON BL.StatusID = T.TypeID AND T.TypeGroup = 'STATUS'
        LEFT JOIN [dbo].[Users] USR ON BL.CreationUserID = USR.UserID
        LEFT JOIN [dbo].[Users] USRS ON BL.UpdateUserID = USRS.UserID
      ,(SELECT O.OfferID 
        ,C.CampaignID
        ,A.AdvertiserID
      FROM Offers AS O JOIN Campaigns AS C ON O.CampaignID = C.CampaignID 
      JOIN Advertisers AS A ON C.AdvertiserID = A.AdvertiserID
      WHERE --O.OfferID = __OFFER_ID__
      C.CampaignID = __CAMPAIGN_ID__) AS OCA 
    WHERE (OCA.OfferID = BL.OfferID OR OCA.CampaignID = BL.CampaignID OR OCA.AdvertiserID = BL.AdvertiserID) `; // 

    const queryUpdate2 = `SELECT  DISTINCT 
      CASE BL.ListType 
        WHEN 'BL' THEN 'BlackList' 
        WHEN 'WL' THEN 'WhiteList' 
        WHEN 'AW' THEN 'AppsNames WL' 
        ELSE '' END AS [ListType]
      ,BL.ListType AS [ListTypeID]
      ,BL.SubPubID AS [SubPubID]
      ,BL.AdvertiserID AS [AdvertiserID]
      ,BL.CampaignID AS [CampaignID]
      ,BL.OfferID AS [OfferID]
      ,BL.isIP AS [isIP]
      ,BL.ControlIP AS [ControlIP]
      ,BL.StatusID AS [StatusID]
    FROM BlackList BL 
      ,(SELECT O.OfferID 
        ,C.CampaignID
        ,A.AdvertiserID
      FROM Offers AS O JOIN Campaigns AS C ON O.CampaignID = C.CampaignID 
      JOIN Advertisers AS A ON C.AdvertiserID = A.AdvertiserID
      WHERE C.CampaignID = __CAMPAIGN_ID__) AS OCA 
    WHERE (OCA.OfferID = BL.OfferID OR OCA.CampaignID = BL.CampaignID OR OCA.AdvertiserID = BL.AdvertiserID)`;

    log('Parametros');
    //const offers = params.offerid;
    const campaignid = params.campaignid;
    //const query = queryUpdate.replace('__OFFER_ID__', offers);
    const query = queryUpdate2.replace('__CAMPAIGN_ID__', campaignid);
    var promiseArray = [];
    var status = false;
    var CreationDate = new Date();
    var blacklist;
    var item;
    var AdvertiserID;
    var CampaignID;
    var OfferID;

    try {
      results = await connector.execute(query);

      if (results != undefined && results.length >= 0) {
        log('Resultado: ' + results.length);
        var retorno = [];
        for (var i = 0; i < results.length; i++) {
          if (results[i].SubPubID == null) {
            log(` NO EXISTE SubPubID ${results[i].SubPubID} `);
          } else {
            log(` ${i} EXISTE SubPubID ${results[i].SubPubID} `);

            status = true;
            item = results[i];
            if (item.StatusID != 'A') status = false;
            CreationDate = new Date();
            AdvertiserID = _.get(item, "AdvertiserID"); if (AdvertiserID != null) AdvertiserID = parseInt(AdvertiserID);
            CampaignID = _.get(item, "CampaignID"); if (CampaignID != null) CampaignID = parseInt(CampaignID);
            OfferID = _.get(item, "OfferID"); if (OfferID != null) OfferID = parseInt(OfferID);
            blacklist = {
              "id": parseInt(_.get(item, "id", 0)),
              "ListType": _.get(item, "ListTypeID"),
              "SubPubID": _.get(item, "SubPubID"),
              "AdvertiserID": AdvertiserID,
              "CampaignID": CampaignID,
              "OfferID": OfferID,
              "Status": status,
              "CreationDate": CreationDate
            };
            retorno.push(blacklist);

            let temp = async (item, blacklist, AdvertiserID, CampaignID, OfferID) => {
              try {
                await db.connection().collection(collection).updateOne(
                  {
                    "ListType": item.ListTypeID,
                    "SubPubID": item.SubPubID,
                    "$or": [
                      { "AdvertiserID": AdvertiserID },
                      { "CampaignID": CampaignID },
                      { "OfferID": OfferID }]
                  },
                  { $set: blacklist },
                  { upsert: true }
                );
                log(`Inserted/Update a document into the Blacklist ${item.SubPubID}.`);
                return `Inserted/Update a document into the Blacklist ${item.SubPubID}.`;
              } catch (err) {
                throw `Error Inserted/Update a document into the Blacklist ${err}.`;
              }
            }

            promiseArray.push(temp(item, blacklist, AdvertiserID, CampaignID, OfferID));
          }
        };
        Promise.all(promiseArray).then(function () {
          resolve({ status: 'BlackList__updated', write_output: true, result: retorno });
        });

      }
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'BlackList_does_not_exist', error: error });
    }

    //Promise.all(promiseArray).then(resolve);
  });
}

var getBLSubPub = function (params) {

  return new Promise(async (resolve, reject) => {
    var OfferID = parseInt(_.get(params, "offerid", 0));
    var SubPubID = _.get(params, "subpubid", null);

    try {

      if ( OfferID!=0 && SubPubID!= null ) {
        let temp =  await entityBlackList.getBLSubPub( OfferID, SubPubID );
        resolve({ status: 'bl_subPub', write_output: true, result: temp });
      } else {
        resolve({ status: 'bl_subPub', write_output: true, result: [] });
      }

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'bl_subPub', write_output: true, result: error });
    }
  });

}

module.exports = {
  registerBlacklist: registerBlacklist,
  createUpdateBlacklist: createUpdateBlacklist,
  getBlacklist: getBlacklist,
  deleteBlacklist: deleteBlacklist,
  getBLSubPub: getBLSubPub
}