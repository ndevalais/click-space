var moment = require('moment');
var log = require("../modules/log");
var _ = require('lodash');
var entityCharts = require('../modules/entity_manager/charts_total_entity');
var entityUser = require('../modules/entity_manager/users_entity');
const { roughSizeOfObject } = require('../modules/tools/index');

var chartsDates = function (params) {
  return new Promise(async (resolve, reject) => {

    try {
      let AccessToken = _.get(params, "http_token_auth", "");
      const AdvertiserID = parseInt(_.get(params, "advertiserid", 0));
      const OfferID = parseInt(_.get(params, "offerid", 0));
      const CampaignID = parseInt(_.get(params, "campaignid", 0));
      const SupplierID = parseInt(_.get(params, "supplierid", 0));
      const DateFrom = moment(params.datefrom, "YYYY-MM-DD");
      const DateTo = moment(params.dateto, "YYYY-MM-DD").add(23, 'hours').add(59, 'minutes');
      const StatusID = params.statusid;
      let timeInitial = Date.now();
      let timeTotal = 0;

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
        let temp = await entityCharts.getChartsDate(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ); 
        let temp2 = await entityCharts.getChartsAdvertisers(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ); 
        let temp3 = await entityCharts.getChartsSuppliers(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ); 
        let temp8 = await entityCharts.getChartsSuppliersCampaign(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ); 
        let temp4 = await entityCharts.getChartsCampaigns(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ); 
        let temp5 = await entityCharts.getChartsDevice(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ); 
        let temp6 = await entityCharts.getChartsCountries(DateFrom, DateTo, AdvertiserID, SupplierID, CampaignID, OfferID, UserID ); 
        let temp7 = await entityCharts.getCountries();
        
        // Obtengo registros totales
        total = temp.length;

        // Obtengo size de la consulta y lo paso a kb
        let totalSize = await roughSizeOfObject(temp);
        totalSize += await roughSizeOfObject(temp2);
        totalSize += await roughSizeOfObject(temp3);
        totalSize += await roughSizeOfObject(temp4);
        totalSize += await roughSizeOfObject(temp5);
        totalSize += await roughSizeOfObject(temp6);
        totalSize += await roughSizeOfObject(temp7);
        totalSize += await roughSizeOfObject(temp8);
        totalSize = (totalSize)/1000;

        timeTotal = (Date.now() - timeInitial )/1000;

        // Armar Lista de Campos 
        if (total>0) arrField = Object.keys(temp[0]);
        resolve(
          { 
            write_output: true, 
            Dates: temp, 
            Advertisers: temp2, 
            Suppliers: temp3, 
            SuppliersCampaign: temp8, 
            Campaigns: temp4, 
            Device: temp5, 
            Countries: temp6, 
            CodeCountries: temp7, 
            total: total, 
            time: timeTotal, 
            size: totalSize 
          }
        );

      } else {
        resolve({ write_output: true, messaje: 'Ivalid parameters date.' });
      }

    } catch (error) {
      log(`Error ${error} rows`);
      reject(`Error ${error} rows`);
    }
  });
}


module.exports = { 
  chartsDates: chartsDates
}