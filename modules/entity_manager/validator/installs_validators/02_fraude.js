/********************
    VALIDO que solo se registre el install 1 vez.
    - El install debe existir 1 vez por cada click.
    - Si ya existe un click entonces, dispara el evento de registro de eventos

*/
const NAME = "Fraude";
const log = require('../../../log');
var _ = require('lodash');
var entityManager = require('../..');
var moment = require("moment");
const c = require('../../../constants');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(function (resolve, reject) {
            log(`Running validation ${NAME} on Install for Click ${objectToValidate.click}`)
            const fraude = _.get(contextToValidateWith, "tr_sub1", "");
            const OfferID = _.get(objectToValidate, "offer.OfferID");
            const SubPubID = _.get(objectToValidate, "click.SubPubID");
            const SubPubHash = _.get(objectToValidate, "click.SubPubHash");
            const p2hash = _.get(objectToValidate, "click.p2hash", "");
            const p2 = _.get(objectToValidate, "click.ExtraParams.p2", "");
            const AdvertiserID = _.get(objectToValidate, "offer.Advertiser.AdvertiserID");
            const CampaignID = _.get(objectToValidate, "offer.Campaign.CampaignID");
            const SupplierID = _.get(objectToValidate, "offer.Supplier.SupplierID"); 
            const AccountManagerID = _.get(objectToValidate, "offer.Supplier.AccountManagerID"); 

            const offer = _.get(objectToValidate, "offer");

            if (fraude != '') { 
                const result = {
                    fraude: fraude,
                    Description: `Valido tr_sub1 si existe Fraude`
                }

                // Pauso SubPubbID - Busco y/o Agrego SubPubbID por OfferID  - BlackList, 
                const blacklist = { 
                    SubPubID: SubPubID, 
                    OfferID: OfferID,  
                    AdvertiserID: AdvertiserID, 
                    CampaignID: CampaignID, 
                    SupplierID: SupplierID, 
                    AccountManagerID: AccountManagerID, 
                    ListType: 'BL', 
                    blackListReason: 'MMP Rejected', 
                    Status: true,
                    offer: offer,
                    SubPubHash: SubPubHash,
                    p2hash: p2hash,
                    SubPubID: SubPubID,
                    p2: p2
                };
                entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_BLACKLIST_REGISTERED, blacklist);

                resolve({ name: NAME, proxy: true, blacklist: blacklist, result: result }); // proxy = false no envia postback al supplier
            } else {
                const result = {
                    Description: `Valido tr_sub1, no existe Fraude`
                }
                resolve({ name: NAME, proxy: true, result: result }); // proxy = false no envia postback al supplier
            }
        });
    }
};

module.exports = validator;
