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
                const debug_validation = _.get(objectToValidate, "debug_validation", false);

                if (VPNCheck == 1) {
                    if (VPNProxyType != '') lOK = false;
                } else lOK = true;

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    if (debug_validation) log(`-- Valido 12-${NAME}: VPNCheck = ${VPNCheck} - VPNProxyType = ${VPNProxyType}`);
                    resolve({
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    });
                } else {
                    if (debug_validation) log(`** ERROR 12-${NAME}: VPNCheck = ${VPNCheck} - VPNProxyType = ${VPNProxyType}`);
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `12-${NAME}: Invalid - VPNCheck = ${VPNCheck} - VPNProxyType = ${VPNProxyType}`
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
