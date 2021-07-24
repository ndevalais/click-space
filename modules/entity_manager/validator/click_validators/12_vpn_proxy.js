/********************
    VALIDO PROXY
    - Si la Campaña esta marcada para validar VPN, realizo validación a partir de los 20 Clicks de la Oferta
*/
const NAME = "VPN_Proxy";
const log = require('../../../log');
let validClick = require('../../utils')
var _ = require('lodash');
var validator = {

    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                let lOK = true;
                let VPNProxyType = _.get(objectToValidate, "AdditionalProxyInfo.VPNProxyType");
                let VPNCheck = _.get(contextToValidateWith, "offer.CampaignHead.VPNCheck");
                
                if (VPNCheck == 1) {
                    if (VPNProxyType != '') lOK = false;
                } else lOK = true;

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    log(`-- Valido - ${NAME} - VPNCheck = ${VPNCheck} - VPNProxyType = ${VPNProxyType}`);
                    resolve({
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    });
                } else {
                    log(`** ERROR - ${NAME} - VPNCheck = ${VPNCheck} - VPNProxyType = ${VPNProxyType}`);
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `${NAME} - Invalid - VPNCheck = ${VPNCheck} - VPNProxyType = ${VPNProxyType}`
                    });
                }

            } catch (e) {
                log(`ERROR - Running validation ${NAME} -> ${e}`)
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
