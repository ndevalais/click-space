/********************
    VALIDO Device Campaign
    - Obtener cantidad de cliks para la Oferta ClickCount > 5 Clicks empiezo la validacion , los primeros 5 no valido 

    if (@DeviceCampaign = 'AND' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'ANDROID'
    if (@DeviceCampaign = 'IOS' OR @DeviceCampaign = 'BTH') AND UPPER(@OSfamily) = 'IOS'
    if (@DeviceCampaign = 'NON')
*/
const NAME = "Country";
const log = require('../../../log');
let validClick = require('../../utils')
let moment = require("moment");
var _ = require('lodash');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const Countrys = _.get(contextToValidateWith, "offer.Campaign.Countrys");
                const CountryCode = _.get(objectToValidate, "AdditionalIPInfo.CountryCode", '');
                const RegionName = _.get(objectToValidate, "AdditionalIPInfo.RegionName", '');
                const CityName = _.get(objectToValidate, "AdditionalIPInfo.CityName", '');
                const CitiesTypes = _.get(contextToValidateWith, "offer.Campaign.CitiesTypes");
                const mensaje = `08-${NAME}: Campaign Country = ${Countrys} - CitiesTypes = ${CitiesTypes} | Click CountryCode = ${CountryCode}-${RegionName}-${CityName}`;
                let lOK = false;
                let isCities = true;

                if (Countrys.indexOf('11') >= 0) lOK = true;
                if (Countrys.indexOf('A1') >= 0) lOK = true;
                if (Countrys.indexOf('A2') >= 0) lOK = true;
                if (Countrys.indexOf('01') >= 0) lOK = true;
                if (Countrys.indexOf(CountryCode) >= 0) lOK = true;

                if (lOK) {
                    //  Si el PAIS es valido valido la Ciudad
                    if (CitiesTypes != '') {
                        isCities = false;
                        if (CitiesTypes.indexOf(CountryCode.concat('-', RegionName, '-', CityName)) >= 0) isCities = true;
                        if (!isCities) lOK = false;
                    }
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
                    log(`** ERROR - ${mensaje}`);
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `${mensaje}`
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
