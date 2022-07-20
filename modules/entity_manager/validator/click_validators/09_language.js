/********************
    VALIDO Device Campaign
    - Obtener cantidad de cliks para la Oferta ClickCount > 5 Clicks empiezo la validacion , los primeros 5 no valido 

    if (@DeviceCampaign = 'AND' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'ANDROID'
    if (@DeviceCampaign = 'IOS' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'IOS'
    if (@DeviceCampaign = 'NON')
*/
const NAME = "Language";
const log = require('../../../log');
let validClick = require('../../utils')
let moment = require("moment");
var _ = require('lodash');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const Language = _.get(objectToValidate, "Language", '');
                const CountryCode = _.get(objectToValidate, "AdditionalIPInfo.CountryCode", '');
                const CodeLanguage = _.get(contextToValidateWith, "offer.Campaign.Languages", '');
                const LanguageCheck = _.get(contextToValidateWith, "offer.CampaignHead.LanguageCheck", '');
                const debug_validation = _.get(objectToValidate, "debug_validation", false);
                let lOK = false;

                if (CodeLanguage!='') {
                    await CodeLanguage.split(',').forEach(element => {
                        if (Language.indexOf(element) >= 0 && element!="") lOK = true;
                    })
                }
                if (LanguageCheck == 0) lOK = true;

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    if (debug_validation) log(`-- Valido 09-${NAME}: CodeLanguage = ${CodeLanguage} - Headers Language = ${Language}`);
                    resolve({
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    });
                } else {
                    if (debug_validation) log(`** ERROR 09-${NAME}: Invalid CodeLanguage = ${CodeLanguage} - Headers Language = ${Language}`);
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `09-${NAME}: - Invalid - CodeLanguage = ${CodeLanguage} - Headers Language = ${Language}`
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
