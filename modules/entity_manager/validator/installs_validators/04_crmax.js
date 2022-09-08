/********************
    VALIDO que solo se registre el install 1 vez.
    - El install debe existir 1 vez por cada click.
    - Si ya existe un click entonces, dispara el evento de registro de eventos

*/
const NAME = "CR MAX";
const log = require('../../../log');
var _ = require('lodash');
var entityManager = require('../..');
var moment = require("moment");
let config = require("../../../config");
const c = require('../../../constants');

var validator = {
    name: NAME,
    doValidate: function (objectToValidate, contextToValidateWith) {
        return new Promise(function (resolve, reject) {
            log(`Running validation ${NAME} on Install for Click ${objectToValidate.click}`)
            //const CampaignID = _.get(objectToValidate, "offer.Campaign.CampaignID");
            const OfferID = _.get(objectToValidate, "offer.OfferID");

            const AdvertiserID = _.get(objectToValidate, "offer.Advertiser.AdvertiserID", 0);
            const CampaignID = _.get(objectToValidate, "offer.Campaign.CampaignID");
            const SupplierID = _.get(objectToValidate, "offer.Supplier.SupplierID"); 
            const AccountManagerID = _.get(objectToValidate, "offer.Supplier.AccountManagerID"); 

            const ControlIP = _.get(objectToValidate, "click.ControlIP");
            const simpleDateYMD = moment().format('YYYYMMDD');
            const SubPubID = _.get(objectToValidate, "click.SubPubID");
            const SubPubHash = _.get(objectToValidate, "click.SubPubHash");
            const p2hash = _.get(objectToValidate, "click.p2hash", "");
            const p2 = _.get(objectToValidate, "click.ExtraParams.p2", "");

            const CantClicksCount = _.get(objectToValidate,`offer.Totals.Offers[${OfferID}].clicks[${simpleDateYMD}].T`,0);
            const TrackingCount = _.get(objectToValidate,`offer.Totals.Offers[${OfferID}].installs[${simpleDateYMD}].T`,0);
            //const TrackingProxy = _.get(objectToValidate,`offer.Totals.Offers[${OfferID}].installs[${simpleDateYMD}].TrackingProxy`,0);

            const proxy = _.get(objectToValidate, "offer.Proxy");
            const CR = _.get(objectToValidate, "offer.CampaignHead.CR",0);
            const CRLimite = parseInt(_.get(config, "CR_LIMITE", 7));; // Inicio de validacion del CR Maximo

            const offer = _.get(objectToValidate, "offer");

            var blacklist = {};
            var result = {};
            var TrackingProxy = false; // false no envia postback al supplier

            // Valido CR Max
            if ( proxy >= 0 ) {
                result = {
                    CantClicksCount: CantClicksCount,
                    CRLimite: CRLimite,
                    TrackingCount: TrackingCount,
                    CR: CR,
                    Description: `Valido CR Maximo`
                }

                if (CR > 0 && CantClicksCount > CRLimite && AdvertiserID != 1) {
                    const CRMaximo = TrackingCount /  CantClicksCount * 100;
                    if ( CRMaximo > CR ) {
                        result.Description = `VALIDO CR y Si los Install es mayor a 100 `;
                        blacklist = { 
                            SubPubID: SubPubID, 
                            OfferID: OfferID, 
                            AdvertiserID: AdvertiserID, 
                            CampaignID: CampaignID, 
                            SupplierID: SupplierID, 
                            AccountManagerID: AccountManagerID, 
                            ListType: 'BL', 
                            blackListReason: 'High CR', 
                            Status: true,
                            offer: offer,
                            SubPubHash: SubPubHash,
                            p2hash: p2hash,
                            SubPubID: SubPubID,
                            p2: p2
                        };
                        entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_BLACKLIST_REGISTERED, blacklist);
                    }
                }

                resolve({ name: NAME, proxy: true, blacklist: blacklist, result: result }); // proxy = false no envia postback al supplier
            } else {
                resolve({ name: NAME, proxy: true, blacklist: blacklist, result: result }); // proxy = false no envia postback al supplier
            }
        });
    }
};

module.exports = validator;
