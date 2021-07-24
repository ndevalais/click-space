var connector = require("../../modules/db_sql/connector2");
var _ = require('lodash');
var { saveCampaignStatus } = require('./offer_entity');

var campaignsStatus = async function (CampaignID, StatusID ) {
  return new Promise(async (resolve, reject) => {
    let sql = '';
    let Status = 'Active';

    try {
      // Actualizo El estado de la campaña en SQL Server
      if (StatusID=='I') {
        Status = 'Paused';
        sql = `UPDATE dbo.Campaigns SET StatusID = '${StatusID}', Featured = 0, UpdateDate = GETUTCDATE()  WHERE CampaignID = ${CampaignID};`;
      } else  {
        sql = `UPDATE dbo.Campaigns SET StatusID = '${StatusID}', UpdateDate = GETUTCDATE() WHERE CampaignID = ${CampaignID}`;
      }
      const results1 = await connector.execute(sql);

      // Actualizo Estado de Offers.Campaign
      const results2 = await saveCampaignStatus(CampaignID, StatusID, Status);
      //result2.modifiedCount

      // Actualizo El Estado de Campaign *** Este punbto es cuando exista Colleccion Campaign
      // CREAR COLLECCION Campaings

      /*} else if ($accion=='ADVERTISER') {
        if ($StatusID=='I') {
          sql = `UPDATE dbo.Campaigns SET StatusID = '${StatusID}', Featured = 0, UpdateDate = GETUTCDATE()  WHERE StatusID = '${StatusIDOLD}' AND AdvertiserID = ".${AdvertiserID}`;
        } else  {
          sql = `UPDATE dbo.Campaigns SET StatusID = '${StatusID}', UpdateDate = GETUTCDATE() WHERE StatusID = '${StatusIDOLD}' AND AdvertiserID = ".${AdvertiserID}.`;
        }
        if ($CampaignIDs!='')
          sql = sql + `AND CampaignID not in (${CampaignIDs}) `;
      } else if ($accion=='TEST') {
        sql = `UPDATE dbo.Campaigns SET StatusID = 'I' , Featured = 0, UpdateDate = GETUTCDATE()
					WHERE
						CreationDate < CONVERT(DATE, '${CreationDate}')
						AND StatusID = 'A'
						AND CountAffiliTest > ${CountAffiliTest}
						AND ISNULL(StatusAffiliTest,0) = 0
						AND AdvertiserID not in (8, 18,19)`;
			if ($CampaignIDs!='')
				sql = sql + `AND CampaignID not in (${CampaignIDs}) `;
      } else {
        throw Error('CampaignID CanNotBeUndefined');
      }*/
      resolve( results2 );
      //return true;
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'Advertiser_PrePay_does_not_exist' });
    }
  })

}
module.exports = {
  campaignsStatus: campaignsStatus
}