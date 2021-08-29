var db = require('../db/index');
var _ = require('lodash');
var moment = require('moment');
var log = require("../log");
const COLLECTION_NAME = "CampaignTotals";

const structTotalsGroup = {
  $group: {
    "totalClick": { $sum: "$totalClick" },
    "totalInstall": { $sum: "$totalInstall" },
    "totalRevenue": { $sum: "$totalRevenue" },
    "totalCost": { $sum: "$totalCost" },
    "totalProfit": { $sum: "$totalProfit" },
    "totalProxy": { $sum: "$totalProxy" },
    "totalEvent": { $sum: "$totalEvent" }
  }
};

const structTotalsProject = {
  $project: {
    "totalClick": { $round: [ "$totalClick", 0 ] },
    "totalInstall": { $round: [ "$totalInstall", 0 ] },
    "totalRevenue": { $round: [ "$totalRevenue", 2 ] },
    "totalCost": { $round: [ "$totalCost", 2 ] },
    "totalProfit": { $round: [ "$totalProfit", 2 ] },
    "totalProxy": { $round: [ "$totalProxy", 0 ] },
    "totalEvent": { $round: [ "$totalEvent", 0 ] }
  }
};

const structHorasGroup = {
  $group: {
    "totalClick": { $sum: "$totalClick" },
    "totalInstall": { $sum: "$totalInstall" },
    "totalRevenue": { $sum: "$totalRevenue" },
    "totalCost": { $sum: "$totalCost" },
    "totalProfit": { $sum: "$totalProfit" },
    "totalProxy": { $sum: "$totalProxy" },
    "totalEvent": { $sum: "$totalEvent" },
    h00c: { $sum: "$h00.clicks" }, h00i: { $sum: "$h00.install" }, h00e: { $sum: "$h00.events" }, h00p: { $sum: "$h00.proxy" },
    h01c: { $sum: "$h01.clicks" }, h01i: { $sum: "$h01.install" }, h01e: { $sum: "$h01.events" }, h01p: { $sum: "$h01.proxy" },
    h02c: { $sum: "$h02.clicks" }, h02i: { $sum: "$h02.install" }, h02e: { $sum: "$h02.events" }, h02p: { $sum: "$h02.proxy" }, 
    h03c: { $sum: "$h03.clicks" }, h03i: { $sum: "$h03.install" }, h03e: { $sum: "$h03.events" }, h03p: { $sum: "$h03.proxy" },
    h04c: { $sum: "$h04.clicks" }, h04i: { $sum: "$h04.install" }, h04e: { $sum: "$h04.events" }, h04p: { $sum: "$h04.proxy" },
    h05c: { $sum: "$h05.clicks" }, h05i: { $sum: "$h05.install" }, h05e: { $sum: "$h05.events" }, h05p: { $sum: "$h05.proxy" },
    h06c: { $sum: "$h06.clicks" }, h06i: { $sum: "$h06.install" }, h06e: { $sum: "$h06.events" }, h06p: { $sum: "$h06.proxy" },
    h07c: { $sum: "$h07.clicks" }, h07i: { $sum: "$h07.install" }, h07e: { $sum: "$h07.events" }, h07p: { $sum: "$h07.proxy" },
    h08c: { $sum: "$h08.clicks" }, h08i: { $sum: "$h08.install" }, h08e: { $sum: "$h08.events" }, h08p: { $sum: "$h08.proxy" },
    h09c: { $sum: "$h09.clicks" }, h09i: { $sum: "$h09.install" }, h09e: { $sum: "$h09.events" }, h09p: { $sum: "$h00.proxy" },
    h10c: { $sum: "$h10.clicks" }, h10i: { $sum: "$h10.install" }, h10e: { $sum: "$h10.events" }, h10p: { $sum: "$h10.proxy" },
    h11c: { $sum: "$h11.clicks" }, h11i: { $sum: "$h11.install" }, h11e: { $sum: "$h11.events" }, h11p: { $sum: "$h11.proxy" },
    h12c: { $sum: "$h12.clicks" }, h12i: { $sum: "$h12.install" }, h12e: { $sum: "$h12.events" }, h12p: { $sum: "$h12.proxy" },
    h13c: { $sum: "$h13.clicks" }, h13i: { $sum: "$h13.install" }, h13e: { $sum: "$h13.events" }, h13p: { $sum: "$h13.proxy" },
    h14c: { $sum: "$h14.clicks" }, h14i: { $sum: "$h14.install" }, h14e: { $sum: "$h14.events" }, h14p: { $sum: "$h14.proxy" },
    h15c: { $sum: "$h15.clicks" }, h15i: { $sum: "$h15.install" }, h15e: { $sum: "$h15.events" }, h15p: { $sum: "$h15.proxy" },
    h16c: { $sum: "$h16.clicks" }, h16i: { $sum: "$h16.install" }, h16e: { $sum: "$h16.events" }, h16p: { $sum: "$h16.proxy" },
    h17c: { $sum: "$h17.clicks" }, h17i: { $sum: "$h17.install" }, h17e: { $sum: "$h17.events" }, h17p: { $sum: "$h17.proxy" },
    h18c: { $sum: "$h18.clicks" }, h18i: { $sum: "$h18.install" }, h18e: { $sum: "$h18.events" }, h18p: { $sum: "$h18.proxy" },
    h19c: { $sum: "$h19.clicks" }, h19i: { $sum: "$h19.install" }, h19e: { $sum: "$h19.events" }, h19p: { $sum: "$h19.proxy" },
    h20c: { $sum: "$h20.clicks" }, h20i: { $sum: "$h20.install" }, h20e: { $sum: "$h20.events" }, h20p: { $sum: "$h20.proxy" },
    h21c: { $sum: "$h21.clicks" }, h21i: { $sum: "$h21.install" }, h21e: { $sum: "$h21.events" }, h21p: { $sum: "$h21.proxy" },
    h22c: { $sum: "$h22.clicks" }, h22i: { $sum: "$h22.install" }, h22e: { $sum: "$h22.events" }, h22p: { $sum: "$h22.proxy" },
    h23c: { $sum: "$h23.clicks" }, h23i: { $sum: "$h23.install" }, h23e: { $sum: "$h23.events" }, h23p: { $sum: "$h23.proxy" },
    h24c: { $sum: "$h24.clicks" }, h24i: { $sum: "$h24.install" }, h24e: { $sum: "$h24.events" }, h24p: { $sum: "$h24.proxy" }
  }
}

const structHorasProject = {
  $project: {
    "totalClick": { $round: [ "$totalClick", 0 ] },
    "totalInstall": { $round: [ "$totalInstall", 0 ] },
    "totalRevenue": { $round: [ "$totalRevenue", 2 ] },
    "totalCost": { $round: [ "$totalCost", 2 ] },
    "totalProfit": { $round: [ "$totalProfit", 2 ] },
    "totalProxy": { $round: [ "$totalProxy", 0 ] },
    "totalEvent": { $round: [ "$totalEvent", 0 ] },
    h00c: 1, h00i: 1, h00e: 1, h00p: 1,
    h01c: 1, h01i: 1, h01e: 1, h01p: 1,
    h02c: 1, h02i: 1, h02e: 1, h02p: 1,
    h03c: 1, h03i: 1, h03e: 1, h03p: 1,
    h04c: 1, h04i: 1, h04e: 1, h04p: 1,
    h05c: 1, h05i: 1, h05e: 1, h05p: 1,
    h06c: 1, h06i: 1, h06e: 1, h06p: 1,
    h07c: 1, h07i: 1, h07e: 1, h07p: 1,
    h08c: 1, h08i: 1, h08e: 1, h08p: 1,
    h09c: 1, h09i: 1, h09e: 1, h09p: 1,
    h10c: 1, h10i: 1, h10e: 1, h10p: 1,
    h11c: 1, h11i: 1, h11e: 1, h11p: 1,
    h12c: 1, h12i: 1, h12e: 1, h12p: 1,
    h13c: 1, h13i: 1, h13e: 1, h13p: 1,
    h14c: 1, h14i: 1, h14e: 1, h14p: 1,
    h15c: 1, h15i: 1, h15e: 1, h15p: 1,
    h16c: 1, h16i: 1, h16e: 1, h16p: 1,
    h17c: 1, h17i: 1, h17e: 1, h17p: 1,
    h18c: 1, h18i: 1, h18e: 1, h18p: 1,
    h19c: 1, h19i: 1, h19e: 1, h19p: 1,
    h20c: 1, h20i: 1, h20e: 1, h20p: 1,
    h21c: 1, h21i: 1, h21e: 1, h21p: 1,
    h22c: 1, h22i: 1, h22e: 1, h22p: 1,
    h23c: 1, h23i: 1, h23e: 1, h23p: 1,
    h24c: 1, h24i: 1, h24e: 1, h24p: 1
  }
}

var  createFilter = async (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID)=>{
  
  var filterMatch = { $match: { CreationDate: { "$gte": new Date(DateFrom), "$lte": new Date(DateTo) } } };
  if (OfferID != 0) {
      //filterMatch = filterMatch + ` "OfferID": ${OfferID},`;
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
  //if (UserID != 0) filterMatch.$match.$or = [{ AccountManagerIDAdv: UserID }, { AccountManagerID: UserID }];
  if (UserID != 0) filterMatch.$match.AccountManagerIDAdv = UserID;
  return filterMatch;
} 

var getChartsDate = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID) {

  try {
      return new Promise(async function  (resolve, reject) {
          try {
              let filterMatch = {};

              filterMatch = await createFilter(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);
              //OfferGUID: { $first: "$OfferGUID" },
              //AdvertiserID: { $first: "$AdvertiserID" },
              //Advertiser: { $first: "$Advertiser" },
              //CampaignID: { $first: "$CampaignID" },
              //Campaign: { $first: "$Campaign" },
              //Device: { $first: "$Device" },
              //Category: { $first: "$Category" },
              //CampaignTypeID: { $first: "$CampaignTypeID" },
              //DailyCap: { $first: "$DailyQuantity" },
              //Countrys: { $first: "$Countries" },
              //SupplierID: { $first: "$SupplierID" },
              //Supplier: { $first: "$Supplier" },
              //AccountManager: { $first: "$AccountManagerAdv" },
              //AccountManagerID: { $first: "$AccountManagerIDAdv" },
              //PostBackURL: { $first: "$PostBackURL" },
              //PostBackURLS: { $first: "$PostBackURL" },
              //Proxy: { $first: "$Proxy" },
              //StatusID: { $first: "$StatusID" },

              /*
              ,{
                    $group: {
                        _id: {
                            CreationDate: "$CreationDate",
                        },
                        AccountManagerIDAdv: { $first: "$AccountManagerIDAdv" },
                        totalClick: { $sum: "$totalClick" },
                        totalInstall: { $sum: "$totalInstall" },
                        totalRevenue: { $sum: "$totalRevenue" },
                        totalCost: { $sum: "$totalCost" },
                        totalProfit: { $sum: "$totalProfit" },
                        totalProxy: { $sum: "$totalProxy" },
                        totalEvent: { $sum: "$totalEvent" },
                      }
                  },
                  {
                    $project: {
                        _id: 0,
                        Date: "$_id.CreationDate",
                        AccountManagerIDAdv: 1,
                        CreationDate: { "$dateToString": { "format": "%d-%m-%Y", "date": "$_id.CreationDate" } },
                        totalClick: { $round: [ "$totalClick", 0 ] },
                        totalInstall: { $round: [ "$totalInstall", 0 ] },
                        totalRevenue: { $round: [ "$totalRevenue", 2 ] },
                        totalCost: { $round: [ "$totalCost", 2 ] },
                        totalProfit: { $round: [ "$totalProfit", 2 ] },
                        totalProxy: { $round: [ "$totalProxy", 0 ] },
                        totalEvent: { $round: [ "$totalEvent", 0 ] },
                    }
                  },
              */

              // Armo Grupo con totales
              var groups = _.clone(structHorasGroup);
              groups.$group._id = {  CreationDate: "$CreationDate" };
              groups.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };

              var project = _.clone(structHorasProject);
              project.$project._id = 0;
              project.$project.Date = "$_id.CreationDate";
              project.$project.AccountManagerIDAdv = 1;
              project.$project.CreationDate = { "$dateToString": { "format": "%d-%m-%Y", "date": "$_id.CreationDate" } };

              db.connection().collection(COLLECTION_NAME).aggregate([
                  filterMatch
                  ,groups
                  ,project
                  ,{ 
                    $sort: {
                        Date: 1
                    } 
                  }
              ],
                  async function (err, data) {
                      let res = await data.toArray();
                      //console.log("Entregando reporte...");
                      resolve(res);
                  });
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

var getChartsAdvertisers = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID) {

  try {
      return new Promise(async function  (resolve, reject) {
          try {
              let filterMatch = {};
              filterMatch = await createFilter(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);             

              var groups = {
                $group: {
                  "totalClick": { $sum: "$totalClick" },
                  "totalInstall": { $sum: "$totalInstall" },
                  "totalRevenue": { $sum: "$totalRevenue" },
                  "totalCost": { $sum: "$totalCost" },
                  "totalProfit": { $sum: "$totalProfit" },
                  "totalProxy": { $sum: "$totalProxy" },
                  "totalEvent": { $sum: "$totalEvent" }
                }
              };
              groups.$group._id = {  AdvertiserID: "$AdvertiserID" };
              groups.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };
              groups.$group.Advertiser = { $first: "$Advertiser" };

              var project = {
                $project: {
                  "totalClick": { $round: [ "$totalClick", 0 ] },
                  "totalInstall": { $round: [ "$totalInstall", 0 ] },
                  "totalRevenue": { $round: [ "$totalRevenue", 2 ] },
                  "totalCost": { $round: [ "$totalCost", 2 ] },
                  "totalProfit": { $round: [ "$totalProfit", 2 ] },
                  "totalProxy": { $round: [ "$totalProxy", 0 ] },
                  "totalEvent": { $round: [ "$totalEvent", 0 ] }
                }
              };
              project.$project._id = 0;
              project.$project.AdvertiserID = "$_id.AdvertiserID";
              project.$project.Advertiser = 1;
              project.$project.AccountManagerIDAdv = 1;

              db.connection().collection(COLLECTION_NAME).aggregate([
                  filterMatch
                  ,groups
                  ,project
                  ,{ 
                    $sort: {
                      totalClick:-1
                    } 
                  }
              ],
                  async function (err, data) {
                      let res = await data.toArray();
                      //console.log("Entregando reporte...");
                      resolve(res);
                  });
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

var getChartsSuppliers = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID) {

  try {
      return new Promise(async function  (resolve, reject) {
          try {
              let filterMatch = {};

              filterMatch = await createFilter(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);             

              var groups = {
                $group: {
                  "totalClick": { $sum: "$totalClick" },
                  "totalInstall": { $sum: "$totalInstall" },
                  "totalRevenue": { $sum: "$totalRevenue" },
                  "totalCost": { $sum: "$totalCost" },
                  "totalProfit": { $sum: "$totalProfit" },
                  "totalProxy": { $sum: "$totalProxy" },
                  "totalEvent": { $sum: "$totalEvent" }
                }
              };
              groups.$group._id = {  SupplierID: "$SupplierID" };
              groups.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };
              groups.$group.Supplier = { $first: "$Supplier" }; 

              var project = {
                $project: {
                  "totalClick": { $round: [ "$totalClick", 0 ] },
                  "totalInstall": { $round: [ "$totalInstall", 0 ] },
                  "totalRevenue": { $round: [ "$totalRevenue", 2 ] },
                  "totalCost": { $round: [ "$totalCost", 2 ] },
                  "totalProfit": { $round: [ "$totalProfit", 2 ] },
                  "totalProxy": { $round: [ "$totalProxy", 0 ] },
                  "totalEvent": { $round: [ "$totalEvent", 0 ] }
                }
              };
              project.$project._id = 0;
              project.$project.SupplierID = "$_id.SupplierID";
              project.$project.Supplier = 1;
              project.$project.AccountManagerIDAdv = 1;

              db.connection().collection(COLLECTION_NAME).aggregate([
                  filterMatch
                  ,groups
                  ,project
                  ,{ 
                    $sort: {
                      totalClick:-1
                    } 
                  }
              ],
                  async function (err, data) {
                      let res = await data.toArray();
                      //console.log("Entregando reporte...");
                      resolve(res);
                  });
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

var getChartsCampaigns = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID) {

  try {
      return new Promise(async function  (resolve, reject) {
          try {
              let filterMatch = {};
              var groups= {};
              var project = {};

              filterMatch = await createFilter(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);             

              groups = {
                $group: {
                  "totalClick": { $sum: "$totalClick" },
                  "totalInstall": { $sum: "$totalInstall" },
                  "totalRevenue": { $sum: "$totalRevenue" },
                  "totalCost": { $sum: "$totalCost" },
                  "totalProfit": { $sum: "$totalProfit" },
                  "totalProxy": { $sum: "$totalProxy" },
                  "totalEvent": { $sum: "$totalEvent" }
                }
              };
              groups.$group._id = {  CampaignID: "$CampaignID" };
              groups.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };
              groups.$group.Campaign = { $first: "$Campaign" };

              project = {
                $project: {
                  "totalClick": { $round: [ "$totalClick", 0 ] },
                  "totalInstall": { $round: [ "$totalInstall", 0 ] },
                  "totalRevenue": { $round: [ "$totalRevenue", 2 ] },
                  "totalCost": { $round: [ "$totalCost", 2 ] },
                  "totalProfit": { $round: [ "$totalProfit", 2 ] },
                  "totalProxy": { $round: [ "$totalProxy", 0 ] },
                  "totalEvent": { $round: [ "$totalEvent", 0 ] }
                }
              };
              project.$project._id = 0;
              project.$project.CampaignID = "$_id.CampaignID";
              project.$project.Campaign = 1;
              project.$project.AccountManagerIDAdv = 1;

              db.connection().collection(COLLECTION_NAME).aggregate([
                  filterMatch
                  ,groups
                  ,project
                  ,{ 
                    $sort: {
                      totalClick:-1
                    } 
                  }
              ],
                  async function (err, data) {
                      let res = await data.toArray();
                      //console.log("Entregando reporte...");
                      resolve(res);
                  });
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

var getChartsSuppliersCampaign = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID) {

  try {
      return new Promise(async function  (resolve, reject) {
          try {
              let filterMatch = {};

              filterMatch = await createFilter(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);             

              var groups = {
                $group: {
                  "totalClick": { $sum: "$totalClick" },
                  "totalInstall": { $sum: "$totalInstall" },
                  "totalRevenue": { $sum: "$totalRevenue" },
                  "totalCost": { $sum: "$totalCost" },
                  "totalProfit": { $sum: "$totalProfit" },
                  "totalProxy": { $sum: "$totalProxy" },
                  "totalEvent": { $sum: "$totalEvent" }
                }
              };
              groups.$group._id = {  SupplierID: "$SupplierID", CampaignID: "$CampaignID"  };
              //groups.$group._id = {  };
              groups.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };
              groups.$group.Supplier = { $first: "$Supplier" }; 

              var project = {
                $project: {
                  "totalClick": { $round: [ "$totalClick", 0 ] },
                  "totalInstall": { $round: [ "$totalInstall", 0 ] },
                  "totalRevenue": { $round: [ "$totalRevenue", 2 ] },
                  "totalCost": { $round: [ "$totalCost", 2 ] },
                  "totalProfit": { $round: [ "$totalProfit", 2 ] },
                  "totalProxy": { $round: [ "$totalProxy", 0 ] },
                  "totalEvent": { $round: [ "$totalEvent", 0 ] }
                }
              };
              project.$project._id = 0;
              project.$project.SupplierID = "$_id.SupplierID";
              project.$project.CampaignID = "$_id.CampaignID";
              project.$project.Supplier = 1;
              project.$project.AccountManagerIDAdv = 1;

              db.connection().collection(COLLECTION_NAME).aggregate([
                  filterMatch
                  ,groups
                  ,project
                  ,{ 
                    $sort: {
                      CampaignID: 1,
                      totalClick:-1
                    } 
                  }
              ],
                  async function (err, data) {
                      let res = await data.toArray();
                      //console.log("Entregando reporte...");
                      resolve(res);
                  });
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

var getChartsDevice = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID) {

  try {
      return new Promise(async function  (resolve, reject) {
          try {
              let filterMatch = {};

              filterMatch = await createFilter(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);             

              var groups = {
                $group: {
                  "totalClick": { $sum: "$totalClick" },
                  "totalInstall": { $sum: "$totalInstall" },
                  "totalRevenue": { $sum: "$totalRevenue" },
                  "totalCost": { $sum: "$totalCost" },
                  "totalProfit": { $sum: "$totalProfit" },
                  "totalProxy": { $sum: "$totalProxy" },
                  "totalEvent": { $sum: "$totalEvent" }
                }
              };
              groups.$group._id = {  Device: "$Device" };
              groups.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };
              //groups.$group.Campaign = { $first: "$Campaign" };

              var project = {
                $project: {
                  "totalClick": { $round: [ "$totalClick", 0 ] },
                  "totalInstall": { $round: [ "$totalInstall", 0 ] },
                  "totalRevenue": { $round: [ "$totalRevenue", 2 ] },
                  "totalCost": { $round: [ "$totalCost", 2 ] },
                  "totalProfit": { $round: [ "$totalProfit", 2 ] },
                  "totalProxy": { $round: [ "$totalProxy", 0 ] },
                  "totalEvent": { $round: [ "$totalEvent", 0 ] }
                }
              };
              project.$project._id = 0;
              //project.$project.Device = "$_id.Device";
              project.$project.Device =  { 
                $cond: { 
                  if: { $eq: ["$_id.Device", "IOS"] }, 
                  then: "iOS", 
                  else: { 
                    $cond: { 
                      if: { $eq: ["$_id.Device", "AND"] }, 
                      then: "Android", 
                      else: "Other"
                    }
                  } 
                } 
              };
              //project.$project.Campaign = 1;
              project.$project.AccountManagerIDAdv = 1;

              db.connection().collection(COLLECTION_NAME).aggregate([
                  filterMatch
                  ,groups
                  ,project
                  ,{ 
                    $sort: {
                      totalClick:-1
                    } 
                  }
              ],
                  async function (err, data) {
                      let res = await data.toArray();
                      //console.log("Entregando reporte...");
                      resolve(res);
                  });
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

var getChartsCountries = function (DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID) {

  try {
      return new Promise(async function  (resolve, reject) {
          try {
              let filterMatch = {};

              filterMatch = await createFilter(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);             

              var groups = {
                $group: {
                  "totalClick": { $sum: "$totalClick" },
                  "totalInstall": { $sum: "$totalInstall" },
                  "totalRevenue": { $sum: "$totalRevenue" },
                  "totalCost": { $sum: "$totalCost" },
                  "totalProfit": { $sum: "$totalProfit" },
                  "totalProxy": { $sum: "$totalProxy" },
                  "totalEvent": { $sum: "$totalEvent" }
                }
              };
              groups.$group._id = {  Countries: "$Countries" };
              groups.$group.AccountManagerIDAdv = { $first: "$AccountManagerIDAdv" };
              //groups.$group.Campaign = { $first: "$Campaign" };

              var project = {
                $project: {
                  "totalClick": { $round: [ "$totalClick", 0 ] },
                  "totalInstall": { $round: [ "$totalInstall", 0 ] },
                  "totalRevenue": { $round: [ "$totalRevenue", 2 ] },
                  "totalCost": { $round: [ "$totalCost", 2 ] },
                  "totalProfit": { $round: [ "$totalProfit", 2 ] },
                  "totalProxy": { $round: [ "$totalProxy", 0 ] },
                  "totalEvent": { $round: [ "$totalEvent", 0 ] }
                }
              };
              project.$project._id = 0;
              project.$project.Countries = "$_id.Countries";
              //project.$project.Campaign = 1;
              project.$project.AccountManagerIDAdv = 1;

              db.connection().collection(COLLECTION_NAME).aggregate([
                  filterMatch
                  ,groups
                  ,project
                  ,{ 
                    $sort: {
                      totalClick:-1
                    } 
                  }
              ],
                  async function (err, data) {
                      let res = await data.toArray();
                      //console.log("Entregando reporte...");
                      resolve(res);
                  });
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

var getCountries = function () {
  try {
      return new Promise(async function  (resolve, reject) {
          try {
            db.connection().collection('RangoIPCountry').aggregate([
              {
                  $group: {
                      _id: {
                          CountryCode: "$CountryCode" 
                      },
                      CountryName: { $first: "$CountryName" } 
                    }
              },
              { $project: {_id: 0, CountryCode: "$_id.CountryCode", CountryName: 1} },
              { $sort: {CountryCode: 1} }
            ],
            async function (err, data) {
                let res = await data.toArray();
                //console.log("Entregando reporte...");
                resolve(res);
            });
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
  getChartsDate: getChartsDate,
  getChartsAdvertisers: getChartsAdvertisers,
  getChartsSuppliers: getChartsSuppliers,
  getChartsSuppliersCampaign: getChartsSuppliersCampaign,
  getChartsCampaigns: getChartsCampaigns,
  getChartsDevice: getChartsDevice,
  getChartsCountries: getChartsCountries,
  getCountries: getCountries
}