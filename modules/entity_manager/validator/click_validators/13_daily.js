/********************
    VALIDO Daily Click
    - Debo Validar que la cantidfad de clicks no superen los cliks de la campaña
    - Obtener cantidade clicks por campaña CountDailyClick
    - Obtener de la Campaña el DailyQuantityClick 
    - Si DailyQuantityClick es > 0 y si DailyQuantityClick < CountDailyClick se debe derivar al rotador.
*/
const NAME = "DailyQuantityInstalls";
const log = require('../../../log');
let validClick = require('../../utils')
let config = require("../../../config");
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
                
                const MargenDaily = parseFloat(_.get(config, "MARGEN_DAILY", 1));
                const CampaignTypeID = _.get(contextToValidateWith, "offer.CampaignHead.CampaignTypeID", '');
                const DailyQuantity = _.get(contextToValidateWith, "offer.Campaign.DailyQuantity", 0);
                const DailyAmount = _.get(contextToValidateWith, "offer.Campaign.DailyAmount", 0);
                const DailyQuantityHead = _.get(contextToValidateWith, "offer.CampaignHead.DailyQuantity", 0);
                const DailyAmountHead = _.get(contextToValidateWith, "offer.CampaignHead.DailyAmount", 0);
                const debug_validation = _.get(objectToValidate, "debug_validation", false);

                let CountCampaign = 0; 
                let RevenueCampaign = 0; 
                let CountCampaignHead = 0; 
                let RevenueCampaignHead = 0; 
                let mensaje = '';
                let lOK = true;

                // Dependiendo del tipo de campaña Obtengo total de clicks/install/eventos y total de Revenue
                if (CampaignTypeID == 'CPC') {
                    CountCampaign = _.get(contextToValidateWith,`offer.Totals.Campaigns[${CampaignID}].clicks[${simpleDateYMD}].T`,0);
                    RevenueCampaign = _.get(contextToValidateWith,`offer.Totals.Campaigns[${CampaignID}].clicks[${simpleDateYMD}].TotalRevenue`,0);
                    CountCampaignHead = _.get(contextToValidateWith,`offer.Totals.clicks[${simpleDateYMD}].T`,0);
                    RevenueCampaignHead = _.get(contextToValidateWith,`offer.Totals.clicks[${simpleDateYMD}].TotalRevenue`,0);
                } else if (CampaignTypeID == 'CP2') {
                    CountCampaign = _.get(contextToValidateWith,`offer.Totals.Campaigns[${CampaignID}].events[${simpleDateYMD}].T`,0);
                    RevenueCampaign = _.get(contextToValidateWith,`offer.Totals.Campaigns[${CampaignID}].events[${simpleDateYMD}].TotalRevenue`,0);
                    CountCampaignHead = _.get(contextToValidateWith,`offer.Totals.events[${simpleDateYMD}].T`,0);
                    RevenueCampaignHead = _.get(contextToValidateWith,`offer.Totals.events[${simpleDateYMD}].TotalRevenue`,0);
                } else {
                    CountCampaign = _.get(contextToValidateWith,`offer.Totals.Campaigns[${CampaignID}].installs[${simpleDateYMD}].T`,0);
                    RevenueCampaign = _.get(contextToValidateWith,`offer.Totals.Campaigns[${CampaignID}].installs[${simpleDateYMD}].TotalRevenue`,0);
                    CountCampaignHead = _.get(contextToValidateWith,`offer.Totals.installs[${simpleDateYMD}].T`,0);
                    RevenueCampaignHead = _.get(contextToValidateWith,`offer.Totals.installs[${simpleDateYMD}].TotalRevenue`,0);
                }

                // Primero valido DailyQuantity de la campaña 
                if (DailyQuantity > 0) {
                    if (CountCampaign > (DailyQuantity * MargenDaily) ) lOK = false;
                    mensaje = `13-${NAME}: ${CampaignTypeID} - Daily Quantity - DailyQuantity ${DailyQuantity} * MargenDaily ${MargenDaily} - CountCampaign = ${CountCampaign}.`
                } else  if (DailyAmount > 0) {
                    if (RevenueCampaign > (DailyAmount * MargenDaily) ) lOK = false;
                    mensaje = `13-${NAME}: ${CampaignTypeID} - Daily Amount - DailyAmount ${DailyAmount} * MargenDaily ${MargenDaily} - RevenueCampaign = ${RevenueCampaign}.`
                }

                // Si esta todo OK, valido DailyQuantity HEAD  NECESITO EL TOTAL POR HEAD
                if (lOK) {
                    if (DailyQuantityHead> 0) {
                        if (CountCampaignHead > (DailyQuantityHead * MargenDaily) ) lOK = false;
                        mensaje = `13-${NAME}: ${CampaignTypeID} - Daily Quantity - DailyQuantityHead ${DailyQuantityHead} * MargenDaily ${MargenDaily} - CountCampaignHead = ${CountCampaignHead}.`
                    } else  if (DailyAmountHead > 0) {
                        if (RevenueCampaignHead > (DailyAmountHead * MargenDaily) )lOK = false;
                        mensaje = `13-${NAME}: ${CampaignTypeID} - Daily Amount - DailyAmountHead ${DailyAmountHead} * MargenDaily ${MargenDaily} - RevenueCampaignHead = ${RevenueCampaignHead}.`
                    }
                }

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    if (debug_validation) log(`-- Valido ${mensaje}`)
                    resolve({ 
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    });
                } else {
                    if (debug_validation) log(`** ${mensaje}`)
                    reject({ 
                        name: NAME,
                        rotator: true,
                        rotatorReason: mensaje
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
