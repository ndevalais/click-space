/********************
    VALIDO BlackList P2
    - Debo Buscar si para el AdvertiserID el CampaignID o la OffertID existe algun registro en la tabla BlackList ListType = 'BL'
    - Si existe es que es una BlackList
    - Se debe buscar el SubPubID si existe es un click Invalido y debo enviar al rotador

    - UPDATE - AGREGO TOTALES PARA EL SUBPUBID en la estructura BlackList *******

*/
const NAME = "p2";
const log = require('../../../log');
var entityManager = require('../..'); //modules/entity_manager
let validClick = require('../../utils')
var _ = require('lodash');
const c = require('../../../constants');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(async function (resolve, reject) {
            try {
                const ListType = "P2";
                const OfferID = _.get(contextToValidateWith, "offer.OfferID");
                const AdvertiserID = _.get(contextToValidateWith, "offer.Advertiser.AdvertiserID");
                const CampaignID = _.get(contextToValidateWith, "offer.Campaign.CampaignID");
                const p2 = _.get(objectToValidate, "p2", "");
                const SubPubID = _.get(objectToValidate, "subpubid");
                const ControlIP = _.get(objectToValidate, "SourceIP");
                const p2hash = _.get(objectToValidate, "p2hash", "");
                const SubPubHash = _.get(objectToValidate, "subpubhash");
                const offer = _.get(contextToValidateWith, "offer");
                const debug_validation = _.get(objectToValidate, "debug_validation", false);
                let countBlackListP2 = 0;
                let lOK = true;


                if (p2 != '') {
                    //countBlackListP2 = await entityManager.getBlacklistP2(OfferID, p2);
                    //if (countBlackListP2 == 0) lOK = true;
                    countBlackListP2 = await entityManager.getBlacklistSubPub(ListType, AdvertiserID, CampaignID, OfferID, p2, ControlIP);
                    if (countBlackListP2 > 0) lOK = false;
                    else lOK = true;
                }
                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    if (debug_validation) log(`-- Valido 15-${NAME}: count BlackList P2 = ${countBlackListP2} - P2 = ${p2}`);
                    resolve({
                        name: NAME,
                        balcklist: false,
                        blackListReason: '',
                        blackListType: ListType,
                        ClickCount: 0,
                        rotator: false,
                        rotatorReason: ''
                    });
                } else {
                    const blacklist = {
                        OfferID: OfferID, 
                        AdvertiserID: AdvertiserID, 
                        CampaignID: CampaignID, 
                        ListType, 
                        blackListReason: 'P2', 
                        Status: true, 
                        offer: offer,
                        SubPubHash: SubPubHash,
                        p2hash: p2hash,
                        SubPubID: SubPubID,
                        p2: p2
                    };
                    if (debug_validation) log(`** ERROR 15-${NAME}: count BlackList P2 = ${countBlackListP2} - P2 = ${p2}`)
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `15-${NAME}: count BlackList P2 = ${countBlackListP2} - P2 = ${p2}`
                    });
                    entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_BLACKLIST_REGISTERED, blacklist);    
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