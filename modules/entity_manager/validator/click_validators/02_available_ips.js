/********************
    VALIDO AvailableIPs
    - Debo Validar que la cantidad de IPs por click
    - Obtener AvailableIPs de la Campaigns
    - Obtener cantida de IP por OffersIPs maximas Duplicadas , variable fija MaxIPs = 2
    - Cuando se intalla se cuenta
    - Si @CountIPS >= @MaxIPs Derivo al rotador
*/
const NAME = "AvailableIPs";
const log = require('../../../log');
let validClick = require('../../utils')
var _ = require('lodash');
let config = require("../../../config");

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const OfferID = _.get(contextToValidateWith, "offer.OfferID");
                const IP2Long = parseInt( _.get(objectToValidate, "AdditionalIPInfo.IP_No"),0 );
                const CountIPS = _.get(contextToValidateWith,`offer.Totals.Offers[${OfferID}].IPs[${IP2Long}].T`,0);
                const MaxIPs = parseInt(_.get(config, "MAX_IPs", 2));
                // "Offers.${OfferID}.IPs.${IP2Long}.T":1
                let lOK = true;
                const mensaje = `02-${NAME}: IP = ${IP2Long} - CountIPS = ${CountIPS} - Max IP = ${MaxIPs}`;
                
                if (CountIPS >= MaxIPs) lOK = false;

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

module.exports = validator;
