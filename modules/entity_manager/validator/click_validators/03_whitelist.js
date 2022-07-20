/********************
 * 
    VALIDO Whitelist
    - Debo Buscar si para el AdvertiserID el CampaignID o la OffertID existe algun registro en la tabla BlackList ListType = 'WL'
    - Si existe es que es una WhiteLis
    - Se debe buscar el SubPubID si existe es un click Valido ,sino debo enviar al rotador

*/
const NAME = "whitelist";
var entityManager = require('../../../entity_manager'); //modules/entity_manager
const log = require('../../../../modules/log');
let validClick = require('../../utils')
let moment = require("moment");
var _ = require('lodash');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const ListType = 'WL';
                const AdvertiserID = _.get(contextToValidateWith, "offer.Advertiser.AdvertiserID");
                const CampaignID = _.get(contextToValidateWith, "offer.Campaign.CampaignID");
                const OfferID = _.get(contextToValidateWith, "offer.OfferID");
                const SubPubID = _.get(objectToValidate, "subpubid");
                const ControlIP = _.get(contextToValidateWith, "SourceIP");
                const debug_validation = _.get(objectToValidate, "debug_validation", false);
                let lOK = true;
                let countWhiteListSubPubID = 0;
                
                log(`********************************** ${SubPubID} **********************************`)

                // Valido si existe para el Advertiser, Campaign u Offers alguna WhiteList
                var countWhiteList = await entityManager.getBlacklist(ListType, AdvertiserID, CampaignID, OfferID )  

                if (countWhiteList > 0) {
                    // Valido si existe en las WhiteList un SubPubID o ControlIP, sino debo enviar al rotador
                    countWhiteListSubPubID = await entityManager.getBlacklistSubPub(ListType, AdvertiserID, CampaignID, OfferID, SubPubID, ControlIP);
                    if (countWhiteListSubPubID > 0) lOK = true;
                    else lOK = false;
                } else lOK = true;

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                lOK = true; // ELIMINO VALIDADOR
                if (lOK) {
                    log(`-- Valido 03-${NAME}: countWhiteList = ${countWhiteList} - countWhiteListSubPubID = ${countWhiteListSubPubID} `);
                    resolve({
                        name: NAME,
                        rotator: false,
                        rotatorReason: ''
                    });
                } else {
                    log(`** ERROR - ${NAME}: countWhiteList = ${countWhiteList} - countWhiteListSubPubID = ${countWhiteListSubPubID}`);
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `${NAME} - countWhiteList = ${countWhiteList} - countWhiteListSubPubID = ${countWhiteListSubPubID}`
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