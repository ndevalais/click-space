/********************
    VALIDO BlackList Supplier
    - Debo Buscar si para el AdvertiserID el CampaignID o la OffertID existe algun registro en la tabla BlackList ListType = 'BL'
    - Si existe es que es una BlackList
    - Se debe buscar el SubPubID si existe es un click Invalido y debo enviar al rotador

    - UPDATE - AGREGO TOTALES PARA EL SUBPUBID en la estructura BlackList *******

*/
const NAME = "BlackList_Supplier";
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
                const ListType = "BS";
                const OfferID = _.get(contextToValidateWith, "offer.OfferID");
                const AdvertiserID = _.get(contextToValidateWith, "offer.Advertiser.AdvertiserID");
                const CampaignID = _.get(contextToValidateWith, "offer.Campaign.CampaignID");
                const SupplierID = _.get(contextToValidateWith, "offer.Supplier.SupplierID");
                const SubPubID = _.get(objectToValidate, "subpubid");
                const SubPubHash = _.get(objectToValidate, "subpubhash");
                const offer = _.get(contextToValidateWith, "offer");
                const p2 = _.get(objectToValidate, "p2", "");
                const p2hash = _.get(objectToValidate, "p2hash", "");
                let countBlackList = 0;
                let lOK = true;

                
                countBlackList = await entityManager.getBlacklistSubPubSupplier(ListType, SupplierID, SubPubID);
                if (countBlackList > 0) lOK = false;
                else lOK = true; 

                lOK = await validClick.validClickCount(contextToValidateWith, lOK);
                if (lOK) {
                    log(`-- Valido 16-${NAME}: count BlackList Supplier = ${SupplierID} - ${countBlackList} - SubPubID = ${SubPubID}`);
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
                    blacklist = { 
                        SubPubID: SubPubID, 
                        OfferID: OfferID, 
                        AdvertiserID: AdvertiserID, 
                        CampaignID: CampaignID, 
                        SupplierID: SupplierID, 
                        ListType: 'BS', 
                        blackListReason: 'Supplier', 
                        Status: true,
                        offer: offer,
                        SubPubHash: SubPubHash,
                        p2hash: p2hash,
                        SubPubID: SubPubID,
                        p2: p2
                    };
                    log(`** ERROR 16-${NAME}: count BlackList Supplier = ${SupplierID} - ${countBlackList} - SubPubID = ${SubPubID}`);
                    reject({
                        name: NAME,
                        rotator: true,
                        rotatorReason: `16-${NAME}: count BlackList Supplier = ${SupplierID} - ${countBlackList} - SubPubID = ${SubPubID}`
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