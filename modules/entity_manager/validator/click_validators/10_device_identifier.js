/********************
    VALIDO Device Campaign
    - Obtener cantidad de cliks para la Oferta ClickCount > 5 Clicks empiezo la validacion , los primeros 5 no valido 

    if (@DeviceCampaign = 'AND' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'ANDROID'
    if (@DeviceCampaign = 'IOS' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'IOS'
    if (@DeviceCampaign = 'NON')
*/
const NAME = "DeviceIdentifier";
const log = require('../../../log');
let validClick = require('../../utils')
var _ = require('lodash');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const OSfamily = _.get(objectToValidate, "AdditionalUserAgentInfo.os.family");
                const GAID = _.get(objectToValidate, "gaid");
                const AndoridAdID = _.get(objectToValidate, "android_adid");
                const tr_sub2 = _.get(objectToValidate, "tr_sub2");
                const IDFA = _.get(objectToValidate, "idfa");
                const DeviceIdentifier = _.get(contextToValidateWith, "offer.Campaign.DeviceIdentifier", '');
                let lOK = false;
                var DeviceID = '';

                // /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test('01234567-9ABC-DEF0-1234-56789ABCDEF0');

                if (DeviceIdentifier == 1) {
                    if (OSfamily.toUpperCase() == 'ANDROID') {
                        DeviceID = AndoridAdID || GAID; // || tr_sub2;
                        lOK = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(DeviceID)
                    }
                    if (OSfamily.toUpperCase() == 'IOS') {
                        DeviceID = IDFA || tr_sub2;
                        lOK = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(DeviceID)
                    }
                } else 
                    lOK = true;

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    log(`-- Valido 10-${NAME}: DeviceID = ${DeviceID} - Family = ${OSfamily}`);
                    resolve({
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    });
                } else {
                    log(`** ERROR 10-${NAME}: DeviceID = ${DeviceID} - Family = ${OSfamily}`);
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `10-${NAME}: Invalid - DeviceID = ${DeviceID} - Family = ${OSfamily}`
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
