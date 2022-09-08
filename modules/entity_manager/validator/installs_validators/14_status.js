/********************
    VALIDO Daily Click
    - Debo Validar que la cantidfad de clicks no superen los cliks de la campaña
    - Obtener cantidade clicks por campaña CountDailyClick
    - Obtener de la Campaña el DailyQuantityClick 
    - Si DailyQuantityClick es > 0 y si DailyQuantityClick < CountDailyClick se debe derivar al rotador.
*/
const NAME = "Status";
const log = require('../../../log');
var _ = require('lodash');
var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const OfferStatusID = _.get(objectToValidate, "offer.StatusID");
                const CampaignStatusID = _.get(objectToValidate, "offer.Campaign.StatusID");
                const AdvertiserID = _.get(objectToValidate, "offer.Advertiser.AdvertiserID", 0);

                if (OfferStatusID != 'A')  lOK = false;
                if (CampaignStatusID != 'A')  lOK = false;

                //lOK = await validClick.validClickCount( contextToValidateWith, lOK );
                if (OfferStatusID != 'A' && AdvertiserID != 1) {
                    log(`** ERROR - ${NAME} Offer - Not Active = ${OfferStatusID} `)
                    objectToValidate.params.TrackingProxy = false;
                    resolve({ 
                        name: NAME, 
                        proxy: false, 
                        result: {OfferStatusID: OfferStatusID, CampaignStatusID: CampaignStatusID} 
                    });
                } else if (CampaignStatusID != 'A' && AdvertiserID != 1)  {
                    log(`** ERROR - ${NAME} Campaign - Not Active = ${CampaignStatusID} `)
                    objectToValidate.params.TrackingProxy = false;
                    resolve({ 
                        name: NAME, 
                        proxy: false, 
                        result: {OfferStatusID: OfferStatusID, CampaignStatusID: CampaignStatusID} 
                    });
                } else {
                    log(`-- Status Offer ${NAME} - Active`)
                    resolve({
                        name: NAME,
                        proxy: true, 
                        result: {OfferStatusID: OfferStatusID, CampaignStatusID: CampaignStatusID} 
                    });
                }
            } catch (e) {
                log(`ERROR - Running validation ${NAME} -> ${e}`)
                objectToValidate.params.TrackingProxy = false;
                resolve({
                    name: NAME,
                    proxy: false, 
                    result: { error:`ERROR - Running validation ${NAME} -> ${e}`}
                });
            }
        });
    }
};

module.exports = validator;
