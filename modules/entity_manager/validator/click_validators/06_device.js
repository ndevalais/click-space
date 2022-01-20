/********************
    VALIDO Device Campaign
    - Obtener cantidad de cliks para la Oferta ClickCount > 5 Clicks empiezo la validacion , los primeros 5 no valido 

    if (@DeviceCampaign = 'AND' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'ANDROID'
    if (@DeviceCampaign = 'IOS' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'IOS'
    if (@DeviceCampaign = 'NON')
*/
const NAME = "Device";
const log = require('../../../log');
let validClick = require('../../utils')
var _ = require('lodash');
var validator = {
    name:NAME,
    doValidate: function (objectToValidate, contextToValidateWith){
        return new Promise(async function(resolve, reject){
            try {
                const DeviceID = _.get(contextToValidateWith, "offer.CampaignHead.Device");
                const OSfamily = _.get(objectToValidate, "AdditionalUserAgentInfo.os.family");
                const OSVersionClick  = _.get(objectToValidate, "AdditionalUserAgentInfo.os.major") + 
                    _.get(objectToValidate, "AdditionalUserAgentInfo.os.minor") + 
                    _.get(objectToValidate, "AdditionalUserAgentInfo.os.patch"); 
                const DeviceVersion = _.get(contextToValidateWith, "offer.Campaign.DeviceVersion", 0);
                const mensaje = `06-${NAME}: DeviceID Campaign = ${DeviceID} - DeviceVersion = ${DeviceVersion} | Click OSfamily = ${OSfamily} - OSVersionClick = ${OSVersionClick}`;
                let lOK = false;

                if ((DeviceID=='AND' || DeviceID=='BTH' || DeviceID.toUpperCase()=='ANDROID') && OSfamily.toUpperCase() == 'ANDROID' ) lOK = true;
                if ((DeviceID=='IOS' || DeviceID=='BTH' || DeviceID.toUpperCase()=='IOS' ) && OSfamily.toUpperCase() == 'IOS' ) lOK = true;
                if (DeviceID=='NON' || DeviceID.toUpperCase()=='ALL' ) lOK = true;

                if (DeviceVersion > 0 && lOK) {
                    lOK = false;
                    if (OSVersionClick>=DeviceVersion) lOK = true;
                }

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    log(`-- Valido ${mensaje}`);
                    resolve({ 
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    }); 
                } else {
                    log(`** ERROR ${mensaje}`);
                    reject({ 
                        name: NAME,
                        rotator: false,
                        rotatorReason: `${mensaje}`
                    }); 
                }
            } catch (e) {
                log(`ERROR - Running validation ${NAME} -> ${e}`)
                resolve({
                    name: NAME,
                    rotator: true,
                    rotatorReason: `ERROR - Running validation ${NAME} -> ${e}`
                });
            }
        });
    }
};

module.exports=validator;
