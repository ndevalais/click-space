/********************
    VALIDO Daily Click
    - Debo Validar que la cantidfad de clicks no superen los cliks de la campaña
    - Obtener cantidade clicks por campaña CountDailyClick
    - Obtener de la Campaña el DailyQuantityClick 
    - Si DailyQuantityClick es > 0 y si DailyQuantityClick < CountDailyClick se debe derivar al rotador.
*/
const NAME = "DailyQuantityClick";
const log = require('../../../../modules/log');
let validClick = require('../../utils')
let moment = require("moment");
var _ = require('lodash');
var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const simpleDateYMD = moment().format('YYYYMMDD');
                const OfferID = _.get(contextToValidateWith, "offer.OfferID");
                const CampaignID = _.get(contextToValidateWith, "offer.Campaign.CampaignID");
                let DailyQuantityClick = _.get(contextToValidateWith, "offer.Campaign.DailyQuantityClick", 0);
                //let CountDailyClick = _.get(contextToValidateWith,`offer.Totals.Offers[${OfferID}].clicks[${simpleDateYMD}].T`,0);
                let CountDailyClick = _.get(contextToValidateWith,`offer.Totals.Campaigns[${CampaignID}].clicks[${simpleDateYMD}].T`,0);
                let lOK = true;
                const ip = _.get(objectToValidate, "SourceIP"); //params.SourceIP
                const debug_validation = _.get(objectToValidate, "debug_validation", false);

                if (DailyQuantityClick > 0 && DailyQuantityClick < CountDailyClick)  lOK = false;
                //if (ClickCounOffer != undefined && ClickCounOffer < ClickCountValid) lOK = true;

                lOK = await validClick.validClickCount( contextToValidateWith, lOK );
                if (lOK) {
                    if (debug_validation) log(`-- Valido 01-${NAME}: ${OfferID} ** ip=${ip} ** DailyQuantityClick = ${DailyQuantityClick} - Total CountDailyClick ${CountDailyClick} by OfferID/Date`)
                    resolve({ 
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    });
                } else {
                    if (debug_validation) log(`** ERROR - ${OfferID} ** ${ip} ** Daily Click ${NAME} - DailyQuantityClick = ${DailyQuantityClick} - Total CountDailyClick ${CountDailyClick} by OfferID/Date`)
                    reject({ 
                        name: NAME,
                        rotator: true,
                        rotatorReason: `Daily Click ${NAME} - DailyQuantityClick = ${DailyQuantityClick} - Total CountDailyClick ${CountDailyClick} by OfferID/Date`
                    });
                }
            } catch (e) {
                if (debug_validation) log(`ERROR - ${OfferID} Running validation ${NAME} -> ${e}`)
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
