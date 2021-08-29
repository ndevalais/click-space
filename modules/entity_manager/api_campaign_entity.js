//var connector = require("../../modules/db_sql/connector2");
var _ = require('lodash');
var log = require("../../modules/log");

/*
{
    "AdvertiserID" : 70, 
    "Api" : "minimob", // Nombre de la 
    "LevelData" : "offers",
    "ApiKey" : "f090cf33-9571-495e-9d6a-5f33a8a2158d",
    "ApiURL" : "http://dashboard.minimob.com/api/v1.1/myoffers?apikey=f090cf33-9571-495e-9d6a-5f33a8a2158d&page=NRO_PAGE",
    "Login" : "",
    "ApiURLLogout" : "",
    "Parameters" : "",
    "Pages" : "nextPageUrl",
    "data" : {
        "ForeignCampaignID" : "id",
        "Campaign" : "name",
        "Icon72" : "appIconLink",
        "MarcketURL" : "appPreviewLink",
        "CountryID" : "countryCode",
        "CampaignTypeID" : "payoutModel",
        "Payout" : "payout",
        "URL" : "objectiveUrl",
        "Device" : "assetType",
        "DailyQuantity" : "dailyConversionCap",
        "DailyAmount" : "",
        "Comments" : "",
        "AppID" : "appId",
        "Incentivized" : ""
    },
    "Macros" : {
        "CampaignClickGUID" : "{Clickid}",
        "SubPubID" : "{Sub_ID}"
    }
}

*/
var updateApiCampaign = async function ( ForeignCampaignID, AdvertiserID, Campaign, Icon72, MarcketURL, CountryID,
  CampaignTypeID, Payout, URL, status, Device, DailyQuantity, DailyAmount, Comments, AppID, Incentivized=0, isPortal) {
  return new Promise(async (resolve, reject) => {
    let retorno = '';
    const querySelect = `SELECT ApiCampaignAvailableID FROM [dbo].[ApiCampaignAvailable]
    WHERE [ForeignCampaignID] = '${ForeignCampaignID}' AND [AdvertiserID] = ${AdvertiserID};`

    const queryUpdate = `UPDATE [dbo].[ApiCampaignAvailable] SET 
        [ForeignCampaignID] = '${ForeignCampaignID}',
        [AvailableDate] = SYSDATETIME(),
        [Campaign] = '${Campaign}',
        [Icon72] = '${Icon72}',
        [MarcketURL] = '${MarcketURL}',
        [CountryID] = '${CountryID}',
        [CampaignTypeID] = '${CampaignTypeID}',
        [Payout] = ${Payout},
        [URL] = '${URL}',
        [status] = '${status}',
        [Device] = '${Device}',
        [DailyQuantity] = '${DailyQuantity}',
        [DailyAmount] = '${DailyAmount}',
        [Comments] = '${Comments}',
        [AppID] = '${AppID}',
        [Incentivized] = ${Incentivized},
        [isPortal] = ${isPortal}
      WHERE [ForeignCampaignID] = '${ForeignCampaignID}' AND [AdvertiserID] = ${AdvertiserID};`

    const queryInsert = `INSERT INTO [dbo].[ApiCampaignAvailable]
        ( [AdvertiserID],
          [ForeignCampaignID],
          [AvailableDate],
          [Campaign],
          [Icon72],
          [MarcketURL],
          [CountryID],
          [CampaignTypeID],
          [Payout],
          [URL],
          [status],
          [Device],
          [DailyQuantity],
          [DailyAmount],
          [Comments],
          [AppID],
          [Incentivized],
          [isPortal])
        VALUES
        ( ${AdvertiserID},
          '${ForeignCampaignID}',
          SYSDATETIME(),
          '${Campaign}',
          '${Icon72}',
          '${MarcketURL}',
          '${CountryID}',
          '${CampaignTypeID}',
          ${Payout},
          '${URL}',
          '${status}',
          '${Device}',
          '${DailyQuantity}',
          '${DailyAmount}',
          '${Comments}',
          '${AppID}',
          ${Incentivized},
          ${isPortal})`;
      
    const queryID = `SELECT SCOPE_IDENTITY() AS ApiCampaignAvailableID`;

    try {

       /* const results1 = await connector.execute( querySelect );
        if (results1 != undefined && results1.length > 0) {
          ApiCampaignAvailableID =results1[0].ApiCampaignAvailableID ;
          const results2 = await connector.execute( queryUpdate );
          retorno = 'Update';
        } else {
          const results3 = await connector.execute( queryInsert );
          const results4 = await connector.execute( queryID );
          retorno = 'Insert';
        }*/

        resolve({retorno});

    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'Advertiser_PrePay_does_not_exist' });
    }
  })

}

var deleteApiCampaign = async function ( AdvertiserID ) {
  return new Promise(async (resolve, reject) => {
    try {
    const querySelect = `DELETE FROM [dbo].[ApiCampaignAvailable] WHERE  [AdvertiserID] = ${AdvertiserID} AND [isPortal] = 0;`
    //const results1 = await connector.execute( querySelect );
    resolve({retorno: 'Delete'});
  } catch (error) {
    log('Error ' + error + ' rows');
    reject({ status: 'Advertiser_PrePay_does_not_exist' });
  }
  })
}

module.exports = {
  updateApiCampaign: updateApiCampaign,
  deleteApiCampaign: deleteApiCampaign
}