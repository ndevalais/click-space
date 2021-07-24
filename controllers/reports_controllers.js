const connector = require("../modules/db_sql/connector2");
const db = require("../modules/db");
var moment = require('moment');
var log = require("../modules/log");
var _ = require('lodash');
var entityReports = require('../modules/entity_manager/reports_entity');
var entityReports2 = require('../modules/entity_manager/campaign_totals_entity');
var entityReportGroup = require('../modules/entity_manager/campaign_total_group');
var entityUser = require('../modules/entity_manager/users_entity');
const ExcelJS = require('exceljs');

/**
 * Reports
 */
var reportsClick = function (params) {
  let fName = "reportsClick()";
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const OfferID = parseInt(_.get(params, "offerid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const StatusID = params.statusid;

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        let temp = await entityReports.getReports(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, false);
        //let temp = await entityReports.getReportsDetailsDate(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, false);

        resolve({ write_output: true, result: temp });
      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}

var reportsDashBoard = function (params) {
  let fName = "reportsDashBoard()";
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      let AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const OfferID = parseInt(_.get(params, "offerid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const StatusID = params.statusid;
      const outType = _.get(params, "output", "json");
      const outFile = "dash_" + moment().format('YYYYMMDD_hmmss') + ".xlsx";

      if (AccessToken=="") AccessToken = _.get(params, "accesstoken", "");

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      var UserName = "";
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
        resolve({ write_output: true, messaje: 'Error User Invalid' });
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
        UserName = User.NAme;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        //let temp2 = await entityReports.getReportDashBoard(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, UserName, false);
        let temp = await entityReports2.getReportDashBoard(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, UserName );
 
        // Armar Lista de Campos 
        arrField = ['OfferID', 'OfferGUID', 'Offer', 'AdvertiserID', 'Advertiser', 'CampaignID', 'Campaign', 'SupplierID',
          'Supplier', 'AccountManager', 'AccountManagerID', 'PostBackURL', 'Proxy', 'CR', 'Cost', 'Revenue', 'StatusID',
          'Status', 'ClickCount', 'TrackingCount', 'TotalRevenue', 'TotalCost', 'TotalProfit', 'TrackingProxy', 'TrackingEvents'];
        
        if (outType == 'xls') {
          resolve({ xls_output: true, result: temp, tituls: arrField, excel: { file: outFile } });
        } else {
          resolve({ write_output: true, result: temp, tituls: arrField });
        }

      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}

var reportsBLSource = function (params) {
  let fName = "reportsBLSource()";
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      let AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD").add(0, 'hours').add(0, 'minutes');
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const outType = _.get(params, "output", "json");
      const outFile = "blsource_" + moment().format('YYYYMMDD_hmmss') + ".xlsx";

      if (AccessToken=="") AccessToken = _.get(params, "accesstoken", "");

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      var UserName = "";
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
        UserName = User.NAme;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        let temp = await entityReports.getReportBLSource(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, UserID, UserName, false);
 
        // Armar Lista de Campos 
        arrField = ['OfferID', 'SubPubID', 'Offer', 'AdvertiserID', 'Advertiser', 'AccountManagerIDAdv', 'AccountManagerAdv', 
          'CampaignID', 'Campaign', 'SupplierID', 'Supplier', 'AccountManager', 'AccountManagerID', 'ClickCount',
        'TrackingCount', 'TrackingProxy', 'TrackingEvents', 'TotalSource', 'CTIT', 'High_CR', 'Low_CR', 'Low_Event_KPI', 'MMP_Rejected'];
        
        if (outType == 'xls') {
          resolve({ xls_output: true, result: temp, tituls: arrField, excel: { file: outFile } });
        } else {
          resolve({ write_output: true, result: temp, tituls: arrField });
        }

      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}

var reportsBLSourceTotals = function (params) {
  let fName = "reportsBLSourceTotals()";
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      let AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD").add(0, 'hours').add(0, 'minutes');
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const outType = _.get(params, "output", "json");
      const outFile = "blsource_" + moment().format('YYYYMMDD_hmmss') + ".xlsx";

      if (AccessToken=="") AccessToken = _.get(params, "accesstoken", "");

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      var UserName = "";
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
        UserName = User.NAme;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        let Advertisers = await entityReports.getReportBLSourceAdvertisers(DateFrom, DateTo, AdvertiserID, UserID, UserName );
        let Campaigns = await entityReports.getReportBLSourceCampaigns(DateFrom, DateTo, AdvertiserID, CampaignID, UserID, UserName );
        let CampaignsSuppliers = await entityReports.getReportBLSourceCampaignsSuppliers(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, UserID, UserName );
        let Suppliers = await entityReports.getReportBLSourceSupplier(DateFrom, DateTo, AdvertiserID, SupplierID, UserID, UserName );
        let Totals = await entityReports.getReportBLSource(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, UserID, UserName );
        
        result = {
          Advertisers: Advertisers,
          Campaigns: Campaigns,
          Suppliers: Suppliers,
          CampaignsSuppliers: CampaignsSuppliers,
          Totals: Totals
        }
        
        resolve({ write_output: true, result: result });

      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}
var reportsDateDetails = function (params) {
  let fName = "reportsDateDetails()";
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      let AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const OfferID = parseInt(_.get(params, "offerid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const StatusID = params.statusid;
      const outType = _.get(params, "output", "json");
      let outFile =  "reportDateSubPub_" + moment().format('YYYYMMDD_hmmss');
      if (outType=="xls") outFile = outFile + ".xlsx";
      if (outType=="csv") outFile = outFile + ".csv";

      if (AccessToken=="") AccessToken = _.get(params, "accesstoken", "");

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        //let temp = await entityReports.getReportsDetailsDate(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, false);
        let temp = await entityReports2.getReportsDetailsDate(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ); 

        //resolve({ write_output: true, result: temp });
        // Armar Lista de Campos 
        arrField = ['CreationDate','AdvertiserID','Advertiser','CampaignID','Campaign','Device',
                    'Category','CampaignTypeID','Countrys','SupplierID','Supplier','AccountManager','Proxy',
                    'totalClick','totalInstall','totalRevenue','totalCost','totalProfit','totalProxy','totalEvent'];
        
        if (outType == 'xls' || outType == 'csv') {
          resolve({ xls_output: true, result: temp, tituls: arrField, excel: { file: outFile, type: outType } });
        } else {
          resolve({ write_output: true, result: temp, tituls: arrField });
        }
      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}

var reportsDateDetailsSubPub = function (params) {
  let fName = "reportsDateDetails()";
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      let AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const OfferID = parseInt(_.get(params, "offerid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const StatusID = params.statusid;
      const outType = _.get(params, "output", "json");
      let outFile = "";
      outFile = "reportDateSubPub_" + moment().format('YYYYMMDD_hmmss');
      if (outType=="xls") outFile = outFile + ".xlsx";
      if (outType=="csv") outFile = outFile + ".csv";

      if (AccessToken=="") AccessToken = _.get(params, "accesstoken", "");

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        let temp = await entityReports.getReportsDetailsDateSubPub(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);

        // Armar Lista de Campos 
        arrField = ['CreationDate','OfferID','OfferGUID','SubPubID','AdvertiserID','Advertiser','CampaignID','Campaign','Device',
                    'Category','CampaignTypeID','DailyCap','Countrys','SupplierID','Supplier','AccountManager','AccountManagerID',
                    'AccountManagerAdv','AccountManagerIDAdv','Proxy','StatusID',
                    'totalClick','totalInstall','totalRevenue','totalCost','totalProfit','totalProxy','totalEvent'];
        
        if (temp.length>0) { 
          if (outType == 'xls' || outType == 'csv') {
            resolve({ xls_output: true, result: temp, tituls: arrField, excel: { file: outFile, type: outType } });
          } else {
            resolve({ write_output: true, result: temp, tituls: arrField });
          }
        } else {
          resolve({ write_output: false, messaje: 'Report empty.' });
        }
      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}
var reportsClickSubPub = function (params) {
  let fName = "reportsClickSubPub()";
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const OfferID = parseInt(_.get(params, "offerid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const StatusID = params.statusid;

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        let temp = await entityReports.getReports(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID, true);

        resolve({ write_output: true, result: temp });
      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}

var reportsTracking = function (params) {
  let fName = "reportsTracking()";
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const AccessToken = _.get(params, "http_token_auth", "");
      const OfferID = parseInt(_.get(params, "offerid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        let temp = await entityReports.getReportsTracking(DateFrom, DateTo, OfferID);

        let doc = [];
        temp.forEach(async function (result) {
          doc.push(result);
          let item = Object.keys(result.Events);
          // Recorro eventos
          /*for (var i = 0; i < item.length; i++) {
            let fecha = moment(item[i], "YYYY-MM-DD");
            if (!fecha.isValid() && item[i] != 'install' && item[i] != 'T' && item[i] != 'event') {
              //doc.push( result );
              let evento = item[i];
              let total = _.get(result, `Events.${evento}.T`, 0);
              if (item[i]=="TotalCost") total = _.get(result, `Events.TotalCost`, 0);
              if (item[i]=="TotalProfit") total = _.get(result, `Events.TotalProfit`, 0);
              if (item[i]=="TotalRevenue") total = _.get(result, `Events.TotalRevenue`, 0);
              if (item[i]=="TrackingProxy") total = _.get(result, `Events.TrackingProxy`, 0);
              doc.push({
                "_id": 0,
                "CampaignClickID": '',
                "SubPubID": result.SubPubID,
                "ClickID": result.ClickID,
                "Event": item[i] + ' - (' + total + ')',
                "FechaClick": "",
                "FechaInstall": "",
                "DifMin": "",
                "TrackingProxy": "",
                "proxy": "",
                "OSfamilyVersion": "",
                "Fraude": "",
                "ColorDefecto": result.ColorDefecto,
                "bgColor": "bg-success",
                "Mostrar": true
              });
            }
          }*/
        });

        resolve({ write_output: true, result: doc });
      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}

/**
 * Reporte de Eventos por SubPub - Agrega columnas con eventos
 * @param {*} params 
 */
var reportsEventSubPub = function (params) {
  let fName = "reportsEventSubPub()";
  return new Promise(async (resolve, reject) => {

    try {
      const collection = 'Offers';
      const AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const OfferID = parseInt(_.get(params, "offerid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const StatusID = params.statusid;
      const outType = _.get(params, "output", "json");
      const outFile = "event_" + moment().format('YYYYMMDD_hmmss') + ".xlsx";
      var UserID = 0;

      // Valido Usuario 
      /*const User = await entityUser.getUser(AccessToken);
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
      }*/

      if (DateFrom.isValid() && DateTo.isValid()) {

        let temp = await entityReports.getReportsEventSubPub(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);

        let doc = [];
        var arrField = ["AdvertiserID", "Advertiser", "CampaignID", "Campaign", "SupplierID", "Supplier", "CreationDate", "SubPubID", "Install"];

        temp.forEach(async function (result) {
          //doc.push(result);
          doc.push({
            "AdvertiserID": result.AdvertiserID,
            "Advertiser": result.Advertiser,
            "CampaignID": result.CampaignID,
            "Campaign": result.Campaign,
            "SupplierID": result.SupplierID,
            "Supplier": result.Supplier,
            "CreationDate": result.CreationDate,
            "SubPubID": result.SubPubID,
            "Install": result.install
          });

          let item = result.events;
          // Recorro eventos y agrego los mismos como columna 
          for (var i = 0; i < item.length; i++) {
            let item1 = Objects(item[i]);
            let item1Keys = Object.keys(item[i]);
            for (var j = 0; j < item1.length; j++) {
              let item2 = Objects(item1[j]);
              let item2Keys = Object.keys(item1[j]);
              for (var k = 0; k < item2.length; k++) {
                let item3 = Objects(item2[k]);
                let item3Keys = Object.keys(item2[k]);
                for (var q = 0; q < item3.length; q++) {
                  let fecha = moment(item3Keys[q], "YYYY-MM-DD");
                  if (!fecha.isValid() && item3Keys[q] != 'install' && item3Keys[q] != 'T' && item3Keys[q] != 'event') {
                    let evento = item3Keys[q];
                    let total = 0
                    if (doc[doc.length - 1][evento] != undefined) total = doc[doc.length - 1][evento];
                    total = total + item3[q];
                    doc[doc.length - 1][evento] = total;
                    if (!arrField.includes(evento)) {
                      arrField.push(evento);
                    }
                  }
                }
              }
            }
          }
        });
        // Ordeno la salida de los campos 
        doc = JSON.parse(JSON.stringify(doc, arrField, arrField.length - 1));
        if (outType == 'xls') {
          resolve({ xls_output: true, result: doc, tituls: arrField, excel: { file: outFile } });
        } else {
          resolve({ write_output: true, result: doc, tituls: arrField });
        }
      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}

var trackingDetails = function (params) {
  let fName = "trackingDetails()";
  return new Promise(async (resolve, reject) => {

    try {
      let AccessToken = _.get(params, "http_token_auth", "");
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const outType = _.get(params, "output", "json");
      let outFile = "reportDateSubPub_" + moment().format('YYYYMMDD_hmmss');
      if (outType=="xls") outFile = outFile + ".xlsx";
      if (outType=="csv") outFile = outFile + ".csv";

      if (AccessToken=="") AccessToken = _.get(params, "accesstoken", "");

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        let temp = await entityReports.getTracking(DateFrom, DateTo, CampaignID);

        let doc = [];
        temp.forEach(async function (result) {
          doc.push(result);
          let item = Object.keys(result.Events);
          // Recorro eventos
          for (var i = 0; i < item.length; i++) {
            let fecha = moment(item[i], "YYYY-MM-DD");
            if (!fecha.isValid() && item[i] != 'install' && item[i] != 'T') {
              //doc.push( result );
              let evento = item[i];
              let total = _.get(result, `Events.${evento}.T`, 0);
              doc.push({
                "_id": 0,
                "CampaignClickID": '',
                "Campaign": '',
                "CampaignClickGUID": '',
                "OfferID": '',
                "SubPubID": result.SubPubID,
                "ClickID": result.ClickID,
                "OSfamily": "",
                "OSfamilyVersion": "",
                "CountryCode": "",
                "CountryName": "",
                "CityName": "",
                "RegionName": "",
                "Domain": "",
                "ISP": "",
                "MobileBrand": "",
                "ControlIp": "",
                "Event": item[i] + ' - ' + total,
                "DateClick": "",
                "DateInstall": "",
                "DifMin": "",
                "TrackingProxy": "",
                "tr_sub1": "",
                "tr_sub2": "",
                "tr_sub3": "",
                "tr_sub4": "",
                "p1": "",
                "p2": "",
                "p3": "",
                "p4": "",
                "proxy": "",
                "Supplier": "",
                "AccountManagerID": "",
                "AccountManager": "",
                "IDFA": "",
                "AndroidAdID": "",
                "IMEI": "",
                "Fraude": ""
              });
            }
          }
        });

        // Armar Lista de Campos 
        arrField = ["_id","CampaignID","Campaign","CampaignClickID","ClickID","Supplier","SubPubID","SubPubHash",
          "p2","DateClick","DateInstall","DifMin","TrackingProxy","tr_sub1","tr_sub2","tr_sub3","tr_sub4","Fraude",
          "OSfamily","OSfamilyVersion","CountryCode","CountryName","CityName","RegionName","Domain","ISP",
          "MobileBrand","ControlIp","Event","p1","p3","p4","proxy","AccountManagerID","AccountManager",
          "IDFA","AndroidAdID","IMEI"];
                
        if (outType == 'xls' || outType == 'csv') {
          resolve({ xls_output: true, result: temp, tituls: arrField, excel: { file: outFile, type: outType } });
        } else {
          resolve({ write_output: true, result: doc, tituls: arrField });
        }
      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}

/** 
 * REPORTES NUEVOS
 */

var reportsCampaignTotal = function (params) {
  let fName = "reportsCampaignTotal()";
  return new Promise(async (resolve, reject) => {

    try {
      let AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const OfferID = parseInt(_.get(params, "offerid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const AccountID = parseInt(_.get(params, "uderid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const clicks = parseInt(_.get(params, "clicks", 0));
      const installs = parseInt(_.get(params, "installs", 0));
      const events = parseInt(_.get(params, "events", 0));
      const opeClicks = _.get(params, "opeclicks", 'Greater');
      const opeInstalls = _.get(params, "opeinstalls", 'Greater');
      const opeEvents = _.get(params, "opeevents", 'Greater');

      const StatusID = params.statusid;
      const outType = _.get(params, "output", "json");
      let isDate = parseInt(_.get(params, "isdate", 0));
      let isAdvertiser = parseInt(_.get(params, "isadvertiser", 0));
      let isCampaign = parseInt(_.get(params, "iscampaign", 0));
      let isSupplier = parseInt(_.get(params, "issupplier", 0));
      let isOffer = parseInt(_.get(params, "isoffer", 0));
      let isSubPub = parseInt(_.get(params, "issubpub", 0));
      let isP2 = parseInt(_.get(params, "isp2", 0));
      let outFile =  "reportTotalClickAdv_" + moment().format('YYYYMMDD_hmmss');
      let total= 0;
      let timeInitial = Date.now();
      let timeTotal = 0;
      let arrField = [];
      let temp;
      if (outType=="xls") outFile = outFile + ".xlsx";
      if (outType=="csv") outFile = outFile + ".csv";

      if (AccessToken=="") AccessToken = _.get(params, "accesstoken", "");

      // Valido Usuario 
      const User = await entityUser.getUser(AccessToken);
      var UserID = 0;
      if (User.UserTypeID == 'ENT') {
        reject(`Error User Invalid`);
      } else if (User.UserTypeID == 'ACM') {
        UserID = User.UserID;
      } else {
        UserID = AccountID;
      }

      if (DateFrom.isValid() && DateTo.isValid()) {
        
        //total = await entityReports2.reportsCampaignTotalCount(
        //  DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);
        if (isSubPub) {
          //total = await entityReportGroup.reportsCampaignTotalCount(
          //  DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID);
          temp = await entityReportGroup.reportsCampaignTotal(
            DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID,
            isDate, isAdvertiser, isCampaign, isSupplier, isOffer,
            clicks, installs, events, opeClicks, opeInstalls, opeEvents, isP2
          ); 
        } else {
          temp = await entityReports2.reportsCampaignTotal(
            DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID,
            isDate, isAdvertiser, isCampaign, isSupplier, isOffer,
            clicks, installs, events, opeClicks, opeInstalls, opeEvents
          ); 
        }

          // Obtengo registros totales
        total = temp.length;

        // Obtengo size de la consulta y lo paso a kb
        let totalSize = await roughSizeOfObject(temp);
        totalSize = (totalSize)/1000;

        // Armar Lista de Campos 
        if (total>0) arrField = Object.keys(temp[0]);
        //['CreationDate','AdvertiserID','Advertiser','CampaignID','Campaign','Device',
        // 'Category','CampaignTypeID','Countrys','SupplierID','Supplier','AccountManager','Proxy',
        // 'totalClick','totalInstall','totalRevenue','totalCost','totalProfit','totalProxy','totalEvent'];
        
        timeTotal = (Date.now() - timeInitial )/1000;

        if (outType == 'xls' || outType == 'csv') {
          resolve({ xls_output: true, result: temp, total: total, time: timeTotal, size: totalSize, tituls: arrField, excel: { file: outFile, type: outType } });
        } else {
          resolve({ write_output: true, result: temp, total: total, time: timeTotal, size: totalSize, tituls: arrField });
        }
      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      console.log("Error en ", fName ,">", error);
      reject(`Error ${error} rows`);
    }
  });
}

function roughSizeOfObject( object ) {

  var objectList = [];

  var recurse = function( value )
  {
      var bytes = 0;

      if ( typeof value === 'boolean' ) {
          bytes = 4;
      }
      else if ( typeof value === 'string' ) {
          bytes = value.length * 2;
      }
      else if ( typeof value === 'number' ) {
          bytes = 8;
      }
      else if
      (
          typeof value === 'object'
          && objectList.indexOf( value ) === -1
      )
      {
          objectList[ objectList.length ] = value;

          for( i in value ) {
              bytes+= 8; // an assumed existence overhead
              bytes+= recurse( value[i] )
          }
      }

      return bytes;
  }

  return recurse( object );
}

function functionName(fun) {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}

module.exports = {
  reportsClick: reportsClick,
  reportsDashBoard: reportsDashBoard,
  reportsBLSource: reportsBLSource,
  reportsClickSubPub: reportsClickSubPub,
  reportsTracking: reportsTracking,
  trackingDetails: trackingDetails,
  reportsDateDetails: reportsDateDetails,
  reportsDateDetailsSubPub: reportsDateDetailsSubPub,
  reportsEventSubPub: reportsEventSubPub,
  reportsBLSourceTotals: reportsBLSourceTotals,
  reportsCampaignTotal: reportsCampaignTotal
}

/***
Obtengo los dias de un rango de fechas

var diasEntreFechas = function(desde, hasta) {
  var dia_actual = desde;
  var fechas = [];
  while (dia_actual.isSameOrBefore(hasta)) {
      fechas.push(dia_actual.format('YYYYMMDD'));
      dia_actual.add(1, 'days');
  }
  return fechas;
};

// Obtengo Fechas y armo consylta de fechas
var results = diasEntreFechas(DateFrom, DateTo);

let project = '{';
results.forEach(function(entry) {
  project = project + `"${entry}": "$clicks.${entry}.T",`;
});
project = project.substring(0,project.length-1);
project = project + ', "_id": 0 }';

let projectDates = JSON.parse(` ${project} `);
*/