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
                const OfferStatusID = _.get(contextToValidateWith, "offer.StatusID");
                const CampaignStatusID = _.get(contextToValidateWith, "offer.Campaign.StatusID");
                const debug_validation = _.get(objectToValidate, "debug_validation", false);
                const AdvertiserID = _.get(contextToValidateWith, "offer.Advertiser.AdvertiserID", 0);

                if (OfferStatusID != 'A')  lOK = false;
                if (CampaignStatusID != 'A')  lOK = false;

                //lOK = await validClick.validClickCount( contextToValidateWith, lOK );
                if (OfferStatusID != 'A' && AdvertiserID != 1) {
                    if (debug_validation) log(`** ERROR - ${NAME} Offer - Not Active = ${OfferStatusID} `)
                    reject({ 
                        name: NAME,
                        Status: 'Inactive',
                        rotator: true,
                        rotatorReason: `** ERROR - ${NAME} Offer - Not Active = ${OfferStatusID} `
                    });
                } else if (CampaignStatusID != 'A' && AdvertiserID != 1)  {
                    if (debug_validation) log(`** ERROR - ${NAME} Campaign - Not Active = ${CampaignStatusID} `)
                    reject({ 
                        name: NAME,
                        Status: 'Inactive',
                        rotator: false,
                        rotatorReason: `** ERROR - ${NAME} Offer - Not Active = ${CampaignStatusID} `
                    });
                } else {
                    if (debug_validation) log(`-- Status Offer 14-${NAME}: Active`)
                    resolve({
                        name: NAME,
                        rotator: false,
                        rotatorReason: `Status Offer 14-${NAME}: Active`
                    });
                }
            } catch (e) {
                if (debug_validation) log(`ERROR - Running validation ${NAME} -> ${e}`)
                resolve({
                    name: NAME,
                    rotator: false,
                    rotatorReason: `ERROR - Running validation ${NAME} -> ${e}`
                });
            }
        });
    }
};

module.exports = validator;
