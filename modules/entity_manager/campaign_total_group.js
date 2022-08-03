var db = require('../db/index');
var _ = require('lodash');
var moment = require('moment');
var log = require("../log");
const COLLECTION_NAME = "CampaignTotalGroup";

var reportsCampaignTotal = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, 
  isDate = false, isAdvertiser = false, isCampaign = false, isSupplier = false, isOffer = false, 
  clicks=0, installs=0, events=0, opeClicks='Greater', opeInstalls='Greater', opeEvents='Greater', isP2 = false ) 
  {
  //Date(DateFrom.year(), DateFrom.month(), DateFrom.day(), 0,0,0).toISOString()
  try {
      return new Promise(function (resolve, reject) {
          try {
              let filterMatch = {};
              let group = {};
              let project = { 
                  $project: {
                      _id: 0
                  } 
              }
              let sort = { $sort: {Date:1} };
              let totalMatch = {$match: {} }; 

              if (opeClicks=='Greater') if (clicks>0) totalMatch.$match.totalClick = {$gte: clicks};
              if (opeClicks=='Less') if (clicks>0) totalMatch.$match.totalClick = {$lte: clicks};
              if (opeClicks=='Equal') if (clicks>=0) totalMatch.$match.totalClick = {$eq: clicks};

              if (opeInstalls=='Greater') if (installs>0) totalMatch.$match.totalInstall = {$gte: installs};
              if (opeInstalls=='Less') if (installs>0) totalMatch.$match.totalInstall = {$lte: installs};
              if (opeInstalls=='Equal') if (installs>=0) totalMatch.$match.totalInstall = {$eq: installs};

              if (opeEvents=='Greater') if (events>0) totalMatch.$match.totalEvent = {$gte: events};
              if (opeEvents=='Less') if (events>0) totalMatch.$match.totalEvent = {$lte: events};
              if (opeEvents=='Equal') if (events>=0) totalMatch.$match.totalEvent = {$eq: events};


              filterMatch = { $match: { "Date": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) } } };
              if (OfferID != 0) {
                  filterMatch = filterMatch + ` "OfferID": ${OfferID},`;
                  filterMatch.$match.OfferID = OfferID;

              } else {
                  if (CampaignID != 0) {
                      filterMatch.$match.CampaignID = CampaignID;
                  } else {
                      if (AdvertiserID != 0) {
                          filterMatch.$match.AdvertiserID = AdvertiserID;
                      }
                  }
              }
              if (SupplierID != 0) filterMatch.$match.SupplierID = SupplierID;
              if (UserID != 0) {
                  //filterMatch.$match.$or = [ { "AccountManagerIDAdv": UserID}, { "AccountManagerID": UserID} ]
                  filterMatch.$match.AccountManagerIDAdv = UserID;// [ { "AccountManagerIDAdv": UserID}, { "AccountManagerID": UserID} ]
              }

              if (isDate) {
                  group = { $group: { _id: { CreationDate: "$Date" } } };
                  project.$project.CreationDate = { "$dateToString": { "format": "%d-%m-%Y", "date": "$_id.CreationDate" } };
              } else {
                  group = { $group: {_id: {} }};
              }

              group.$group._id.OfferID = "$OfferID";
              group.$group._id.SubPubHash = "$SubPubHash";
              if (isP2) {
                group.$group._id.p2hash = "$p2hash";
                group.$group.P2 = { $first: "$P2" };
              }
              group.$group.SubPubID = { $first: "$SubPubID" };
              group.$group.AdvertiserID = { $first: "$AdvertiserID" };
              group.$group.Advertiser = { $first: "$Advertiser" };
              group.$group.CampaignID = { $first: "$CampaignID" };
              group.$group.Campaign = { $first: "$Campaign" };
              group.$group.Category = { $first: "$Category" };
              group.$group.CampaignTypeID = { $first: "$CampaignTypeID" };
              group.$group.DailyCap = { $first: "$DailyCap" };
              group.$group.Countries = { $first: "$Countries" };
              group.$group.Cost = { $first: "$Cost" };
              group.$group.Revenue = { $first: "$Revenue" };
              group.$group.Proxy = { $first: "$Proxy" };
              group.$group.SupplierID = { $first: "$SupplierID" };
              group.$group.Supplier = { $first: "$Supplier" };
              group.$group.AccountManager = { $first: "$AccountManager" };
              group.$group.AccountManagerID = { $first: "$AccountManagerID" };
              group.$group.AccountManagerAdv = { $first: "$AccountManagerAdv" };
              group.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };

              project.$project.OfferID = "$_id.OfferID";
              project.$project.SubPubHash = "$_id.SubPubHash";
              project.$project.SubPubID = 1;
              if (isP2) {
                //project.$project.SubPubID = { $concat: ["$SubPubID", " | ", { $ifNull: ["$P2", "p2 Empty"] }] };
                project.$project.P2 = 1;
              }
              project.$project.AdvertiserID = 1;
              project.$project.Advertiser = 1;
              project.$project.CampaignID = 1;
              project.$project.Campaign = 1;
              project.$project.Device = 1;
              project.$project.Category = 1;
              project.$project.CampaignTypeID = 1;
              project.$project.DailyCap = 1;
              project.$project.Countries = 1;
              project.$project.Cost = 1;
              project.$project.Revenue = 1;
              project.$project.Proxy = 1;
              project.$project.SupplierID = 1;
              project.$project.Supplier = 1;
              project.$project.AccountManager = 1;
              project.$project.AccountManagerID = 1;
              project.$project.AccountManagerAdv = 1;
              project.$project.AccountManagerIDAdv = 1;

              group.$group.totalClick ={ $sum: "$ClickCount" };
              group.$group.totalInstall = { $sum: "$TrackingCount" };
              group.$group.totalRevenue = { $sum: "$TotalRevenue" };
              group.$group.totalCost = { $sum: "$TotalCost" };
              group.$group.totalProfit = { $sum: "$TotalProfit" };
              group.$group.totalProxy = { $sum: "$TrackingProxy" };
              group.$group.totalEvent = { $sum: "$TrackingEvent" };
              group.$group.totalSource = { $sum: "$TotalSource" };

              project.$project.totalClick = { $round: [ "$totalClick", 0 ] };
              project.$project.totalInstall = { $round: [ "$totalInstall", 0 ] };
              project.$project.totalRevenue = { $round: [ "$totalRevenue", 2 ] };
              project.$project.totalCost = { $round: [ "$totalCost", 2 ] };
              project.$project.totalProfit = { $round: [ "$totalProfit", 2 ] };
              project.$project.totalProxy = { $round: [ "$totalProxy", 0 ] };
              project.$project.totalEvent = { $round: [ "$totalEvent", 0 ] };
              project.$project.totalSource = { $round: [ "$totalSource", 0 ] }; 
              project.$project.CR = { $cond: [{ $eq: ["$totalClick", 0] }, 0, { $divide: [{ $multiply: ["$totalInstall", 100] }, "$totalClick"] }] },

              db.connection().collection(COLLECTION_NAME).aggregate([
                      filterMatch
                      ,group
                      ,totalMatch
                      ,project
                      ,sort
                  ],
                  {
                      allowDiskUse: true
                  },
                      async function (err, data) {
                          let res = await data.toArray();
                          //console.log("Entregando reporte...");
                          resolve(res);
                          //let x = roughSizeOfObject(res)
                          //var size = Object.bsonsize(obj);
                          //print('_id: '+obj._id+' || Size: '+size+'B -> '+Math.round(size/(1024))+'KB -> '+Math.round(size/(1024*1024))+'MB (max 16MB)');
                      }
              );
          } catch (error) {
              log(`Error ${error} rows`);
              reject(`Error ${error} rows`);
          }
      });
  } catch (error) {
      log(`report: ${error}`);
      return false;
  }
}

var reportsCampaignTotalCount = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ) 
  {
  try {
      return new Promise(function (resolve, reject) {
          try {
              let filterMatch = {};

              filterMatch = { $match: { "Date": { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) } } };
              if (OfferID != 0) {
                  filterMatch = filterMatch + ` "OfferID": ${OfferID},`;
                  filterMatch.$match.OfferID = OfferID;

              } else {
                  if (CampaignID != 0) {
                      filterMatch.$match.CampaignID = CampaignID;
                  } else {
                      if (AdvertiserID != 0) {
                          filterMatch.$match.AdvertiserID = AdvertiserID;
                      }
                  }
              }
              if (SupplierID != 0) filterMatch.$match.SupplierID = SupplierID;
              if (UserID != 0) {
                  filterMatch.$match.AccountManagerIDAdv = UserID;
              }
              
              db.connection().collection(COLLECTION_NAME).aggregate([
                      filterMatch
                      ,{
                          $group: {
                             _id: null,
                             count: { $sum: 1 }
                          }
                      }
                  ],
                  {
                      allowDiskUse: true
                  },
                      async function (err, data) {
                          let res = await data.toArray();
                          //console.log("Entregando reporte...");
                          let retorno = 0;
                          if (res.length>0) {
                              retorno = res[0].count;
                          }
                          resolve(retorno);
                      }
              );
          } catch (error) {
              log(`Error ${error} rows`);
              reject(`Error ${error} rows`);
          }
      });
  } catch (error) {
      log(`report: ${error}`);
      return false;
  }
}

module.exports = {
  reportsCampaignTotal: reportsCampaignTotal,
  reportsCampaignTotalCount: reportsCampaignTotalCount
}

