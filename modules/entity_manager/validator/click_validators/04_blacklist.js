/********************
    VALIDO BlackList
    - Debo Buscar si para el AdvertiserID el CampaignID o la OffertID existe algun registro en la tabla BlackList ListType = 'BL'
    - Si existe es que es una BlackList
    - Se debe buscar el SubPubID si existe es un click Invalido y debo enviar al rotador

    - UPDATE - AGREGO TOTALES PARA EL SUBPUBID en la estructura BlackList *******

*/
const NAME = "blacklist";
const log = require('../../../log');
var entityManager = require('../../../entity_manager'); //modules/entity_manager
let validClick = require('../../utils')
let moment = require("moment");
var _ = require('lodash');
const c = require('../../../constants');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const ListType = 'BL';
                const AdvertiserID = _.get(contextToValidateWith, "offer.Advertiser.AdvertiserID");
                const CampaignID = _.get(contextToValidateWith, "offer.Campaign.CampaignID");
                const OfferID = _.get(contextToValidateWith, "offer.OfferID");
                const SubPubID = _.get(objectToValidate, "subpubid", "");
                const ControlIP = _.get(objectToValidate, "SourceIP");
                const offer = _.get(contextToValidateWith, "offer");
                const p2hash = _.get(objectToValidate, "p2hash");
                const p2 = _.get(objectToValidate, "p2");
                const SubPubHash = _.get(objectToValidate, "subpubhash");
                let lOK = true;
                let countBlackListSubPubID = 0;

                // Valido si existe para el Advertiser, Campaign u Offers alguna blacklist
                var countBlackList = await entityManager.getBlacklist(ListType, AdvertiserID, CampaignID, OfferID);

                if (countBlackList > 0) {
                    // Valido si existe en las BlackList un SubPubID o ControlIP NO
                    countBlackListSubPubID = await entityManager.getBlacklistSubPub(ListType, AdvertiserID, CampaignID, OfferID, SubPubID, ControlIP);
                    if (countBlackListSubPubID > 0) lOK = false;
                    else lOK = true;
                } else lOK = true;

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    log(`-- Valido 04-${NAME}: countBlackList = ${countBlackList} - countBlackListSubPubID = ${countBlackListSubPubID}`);
                    resolve({
                        name: NAME,
                        balcklist: false,
                        blackListReason: '',
                        blackListType: ListType,
                        ClickCount: 0,
                        rotator: false,
                        rotatorReason: '',
                        p2hash: p2hash,
                        SubPubHash: SubPubHash,
                        SubPubID: SubPubID,
                        p2: p2
                    });
                } else {
                    const blacklist = { 
                        SubPubID: SubPubID, 
                        OfferID: OfferID, 
                        AdvertiserID: AdvertiserID, 
                        CampaignID: CampaignID, 
                        ListType: 'BL', 
                        blackListReason: '', 
                        Status: true, 
                        offer: offer,
                        p2hash: p2hash,
                        SubPubHash: SubPubHash,
                        SubPubID: SubPubID,
                        p2: p2
                     };
                    log(`** ERROR - ${NAME} - countBlackList = ${countBlackList} - countBlackListSubPubID = ${countBlackListSubPubID}`)
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `${NAME} - countBlackList = ${countBlackList} - countBlackListSubPubID = ${countBlackListSubPubID}`
                    });
                    entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_BLACKLIST_REGISTERED, blacklist);                    
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