/** 
    CAP_Click de 1000 validar contra la cantidad de clicks de la oferta
    CAP_install de 100 validar contra los install o eventos de la oferta
    La campaña 1000 click por dia , ademas debemos validar com
    VALIDO Daily Click
    - Debo Validar que la cantidfad de clicks no superen los cliks de la campaña
    - Obtener cantidade clicks por campaña CountDailyClick
    - Obtener de la Campaña el DailyQuantityClick 
    - Si DailyQuantityClick es > 0 y si DailyQuantityClick < CountDailyClick se debe derivar al rotador.
*/
const NAME = "DailyQuantityInstalls";
const log = require('../../../log');
let config = require("../../../config");
let moment = require("moment");
var _ = require('lodash');
var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const simpleDateYMD = moment().format('YYYYMMDD');
                const OfferID = _.get(objectToValidate, "offer.OfferID");

                const DailyCapInstallOffer = _.get(objectToValidate, "offer.DailyCap", 0);
                const CountDailyInstallOffer = _.get(objectToValidate,`offer.Totals.Offers[${OfferID}].installs[${simpleDateYMD}].T`,0);
                let lOK = true;
                let mensaje = '';

                if (DailyCapInstallOffer > 0 && DailyCapInstallOffer < CountDailyInstallOffer)  lOK = false;

                if (!lOK)  {
                    log(`** ERROR - ${NAME} Count Offer = ${DailyCapInstallOffer} - Total ${CountDailyInstallOffer}`)
                    objectToValidate.params.TrackingProxy = false;
                    resolve({ 
                        name: NAME, 
                        proxy: false, 
                        result: {DailyCapInstallOffer: DailyCapInstallOffer, CountDailyInstallOffer: CountDailyInstallOffer} 
                    });
                } else {
                    log(`-- Status Offer ${NAME} - Active`)
                    resolve({
                        name: NAME,
                        proxy: true, 
                        result: {DailyCapInstallOffer: DailyCapInstallOffer, CountDailyInstallOffer: CountDailyInstallOffer} 
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







