/********************
    VALIDO Device Campaign
    - Obtener cantidad de cliks para la Oferta ClickCount > 5 Clicks empiezo la validacion , los primeros 5 no valido 

    if (@DeviceCampaign = 'AND' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'ANDROID'
    if (@DeviceCampaign = 'IOS' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'IOS'
    if (@DeviceCampaign = 'NON')
*/
const NAME = "Carriers";
const log = require('../../../log');
let validClick = require('../../utils')
var _ = require('lodash');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const CampaignTypeID = _.get(contextToValidateWith, "offer.CampaignHead.CampaignTypeID", '');
                const CarriersTypes = _.get(contextToValidateWith, "offer.Campaign.CarriersTypes", '');
                const MobileBrand = _.get(objectToValidate, "AdditionalIPInfo.MobileBrand", '').toUpperCase();
                const CountryCode = _.get(objectToValidate, "AdditionalIPInfo.CountryCode", '');
                const debug_validation = _.get(objectToValidate, "debug_validation", false);
                let lOK = false;

                if (CampaignTypeID == 'CPA') {
                    if (CarriersTypes == 'ALL-WIFI-SI') lOK = true;
                    else if (CarriersTypes == 'ALL-WIFI-NO' && MobileBrand == '-') lOK = true;
                    else if (CarriersTypes == 'ONLY-WIFI' && MobileBrand == '-') lOK = true;
                    else if (CarriersTypes.indexOf('WIFI-CUSTOM') > 0 && (MobileBrand == '-' || CarriersTypes.indexOf(CountryCode.concat('-',MobileBrand)) > 0 )) lOK = true;
                    else {
                        if (CarriersTypes.indexOf(CountryCode.concat('-',MobileBrand)) > 0) lOK = true;
                    }
                } else lOK = true;

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    if (debug_validation) log(`-- Valido 11-${NAME}: CampaignTypeID = ${CampaignTypeID} - CarriersTypes = ${CarriersTypes} - MobileBrand = ${CountryCode} ${MobileBrand}`);
                    resolve({
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    });
                } else {
                    if (debug_validation) log(`** ERROR 11-${NAME}: CampaignTypeID = ${CampaignTypeID} - CarriersTypes = ${CarriersTypes} - MobileBrand = ${CountryCode} ${MobileBrand}`);
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `11-${NAME}: CampaignTypeID = ${CampaignTypeID} - CarriersTypes = ${CarriersTypes} - MobileBrand = ${CountryCode} ${MobileBrand}`
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
