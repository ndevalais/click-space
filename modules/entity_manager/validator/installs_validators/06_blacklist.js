/********************
    VALIDO BlackList
    - Debo Buscar si para el AdvertiserID el CampaignID o la OffertID existe algun registro en la tabla BlackList ListType = 'BL'
    - Si existe es que es una BlackList
    - Se debe buscar el SubPubID si existe es un click Invalido y debo enviar al rotador

    - UPDATE - AGREGO TOTALES PARA EL SUBPUBID en la estructura BlackList *******

*/
const NAME = "blacklist";
const log = require('../../../log');
var entityManager = require('../..'); //modules/entity_manager
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
                const AdvertiserID = _.get(objectToValidate, "offer.Advertiser.AdvertiserID", 0);
                const CampaignID = _.get(objectToValidate, "offer.Campaign.CampaignID");
                const OfferID = _.get(objectToValidate, "offer.OfferID");
                const SubPubID = _.get(objectToValidate, "click.SubPubID", "");
                const SubPubHash = _.get(objectToValidate, "click.SubPubHash");
                const p2hash = _.get(objectToValidate, "click.p2hash", "");
                const p2 = _.get(objectToValidate, "click.ExtraParams.p2", "");
                const ControlIP = _.get(contextToValidateWith, "SourceIP");
                const offer = _.get(objectToValidate, "offer");
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
                // Si el Advertiser es 1 (LAIKAD) paso la validacion
                if (AdvertiserID ==1 ) lOK = true;
                //lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    log(`-- Valido - ${NAME} - countBlackList = ${countBlackList} - countBlackListSubPubID = ${countBlackListSubPubID}`);
                    resolve({
                        name: NAME,
                        proxy: true, 
                        rotatorReason: ''
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
                        SubPubHash: SubPubHash,
                        p2hash: p2hash,
                        SubPubID: SubPubID,
                        p2: p2
                    };
                    log(`** ERROR - ${NAME} - countBlackList = ${countBlackList} - countBlackListSubPubID = ${countBlackListSubPubID}`)
                    resolve({
                        name: NAME,
                        proxy: false, 
                        result: blacklist
                    });
                    objectToValidate.params.TrackingProxy = false;
                    entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_BLACKLIST_REGISTERED, blacklist);                    
                }
            } catch (e) {
                log(`ERROR - Running validation ${NAME} -> ${e}`)
                resolve({
                    name: NAME,
                    proxy: false, 
                    result: {error:`ERROR - Running validation ${NAME} -> ${e}`}
                });
            }
        });
    }
};

module.exports = validator;