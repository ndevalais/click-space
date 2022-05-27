var _ = require('lodash');
const log = require('../log');

var updateAdvertiserPrePay = async function (param, Revenue) {
  return new Promise(async (resolve, reject) => {
    //const Revenue = parseFloat(_.get(param, "context.click.Revenue", 0));
    const PrePay = _.get(param, "context.offer.Advertiser.Prepay", false);
    let PrepayTerms = parseFloat(_.get(param, "context.offer.Advertiser.PrepayTerms", 0));
    const Budget = _.get(param, "context.offer.CampaignHead.Prepay", false);
    let BudgetTerms = parseFloat(_.get(param, "context.offer.CampaignHead.PrepayTerms", 0));
    const CampaignHeadID = _.get(param, "context.offer.CampaignHead.CampaignHeadID");
    const AdvertiserID = _.get(param, "context.offer.Advertiser.AdvertiserID");

    try {
      /*if (PrePay) {
        if (AdvertiserID) {
          PrepayTerms = PrepayTerms - Revenue;
          results1 = await connector.execute(`UPDATE [dbo].[Advertisers] SET [PrepayTerms] = ${PrepayTerms} WHERE [AdvertiserID] = ${AdvertiserID};`);
          if ((PrepayTerms - Revenue) <= 0) {
            results2 = await connector.execute(`UPDATE dbo.Campaigns SET [StatusID] = 'I' WHERE [AdvertiserID] = ${AdvertiserID} AND [StatusID] = 'A'`);
          }
        } else {
          throw Error('AdvertiserIDCanNotBeUndefined');
        }
      }
      if (Budget) {
        if (CampaignHeadID) {
          BudgetTerms = BudgetTerms - Revenue;
          results3 = await connector.execute(`UPDATE [dbo].[CampaignsHead] SET [PrepayTerms] = ${BudgetTerms} WHERE [CampaignHeadID] = ${CampaignHeadID};`);
          if ((BudgetTerms - Revenue) <= 0) {
            results4 = await connector.execute(`UPDATE dbo.Campaigns SET [StatusID] = 'I' WHERE [CampaignHeadID] = ${CampaignHeadID} AND [StatusID] = 'A'`);
          }
        } else {
          throw Error('CampaignHeadCanNotBeUndefined');
        }
      }*/
      throw Error('CampaignHeadCanNotBeUndefined');
      //return true;
    } catch (error) {
      log('Error ' + error + ' rows');
      reject({ status: 'Advertiser_PrePay_does_not_exist' });
    }
  })

}
module.exports = {
  updateAdvertiserPrePay: updateAdvertiserPrePay
}