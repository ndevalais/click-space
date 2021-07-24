/********************
    VALIDO que solo se registre el install 1 vez.
    - El install debe existir 1 vez por cada click.
    - Si ya existe un click entonces, dispara el evento de registro de eventos

*/
const NAME = "Time Install";
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
            const OfferID = _.get(objectToValidate, "offer.OfferID");
            const simpleDateYMD = moment().format('YYYYMMDD');
            const SubPubID = _.get(objectToValidate, "click.SubPubID");
            const SubPubHash = _.get(objectToValidate, "click.SubPubHash");
            const p2hash = _.get(objectToValidate, "click.p2hash", "");
            const p2 = _.get(objectToValidate, "click.ExtraParams.p2", "");
            const AdvertiserID = _.get(objectToValidate, "offer.Advertiser.AdvertiserID");
            const CampaignID = _.get(objectToValidate, "offer.Campaign.CampaignID");
            const SupplierID = _.get(objectToValidate, "offer.Supplier.SupplierID"); 
            const AccountManagerID = _.get(objectToValidate, "offer.Supplier.AccountManagerID"); 

            const TimeInstallMin = parseInt(_.get(objectToValidate, "offer.CampaignHead.TimeInstallMin",0));
            const TimeInstall = parseInt(_.get(objectToValidate, "offer.CampaignHead.TimeInstall",0));
            const TrackingTime = _.get(objectToValidate,`offer.Totals.Offers[${OfferID}].SubPub[${SubPubHash}].installs[${simpleDateYMD}].T`,0); 

            const CreationDate = _.get(objectToValidate, "click.CreationDate");
            const Today = moment(new Date());
            const DiffInstall = moment.duration(Today.diff(CreationDate));

            const offer = _.get(objectToValidate, "offer");

            // @DiffInstall = DATEDIFF(SECOND, click.CreationDate, GETUTCDATE())

            if (TimeInstall > 0) {
                if ( ( DiffInstall.asSeconds() < TimeInstallMin || DiffInstall.asSeconds() > TimeInstall ) ) { //&& TrackingTime > 1 ) {
                    const result = {
                        CreationDate: CreationDate,
                        DiffInstall: DiffInstall.asSeconds(),
                        TimeInstallMin: TimeInstallMin,
                        TimeInstall: TimeInstall,
                        Description: `El Install esta fuera del rango de Tiempos - Agrego BL ${SubPubID}`
                    }
                    // Pauso SubPubbID
                    // Busco y/o Agrego SubPubbID por OfferID  - BlackList
                    const blacklist = { 
                        SubPubID: SubPubID, 
                        OfferID: OfferID,  
                        AdvertiserID: AdvertiserID, 
                        CampaignID: CampaignID, 
                        SupplierID: SupplierID, 
                        AccountManagerID: AccountManagerID, 
                        ListType: 'BL', 
                        blackListReason: 'CTIT', 
                        Status: true,
                        offer: offer,
                        SubPubHash: SubPubHash,
                        p2hash: p2hash,
                        SubPubID: SubPubID,
                        p2: p2 
                    };
                    entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_BLACKLIST_REGISTERED, blacklist);
                    objectToValidate.params.TrackingTime = TrackingTime + 1;
                    resolve({ name: NAME, proxy: true, blacklist: blacklist, result: result }); // proxy = false no envia postback al supplier
                } else {
                    const result = {
                        CreationDate: CreationDate,
                        DiffInstall: DiffInstall.asSeconds(),
                        TimeInstallMin: TimeInstallMin,
                        TimeInstall: TimeInstall,
                        Description: `El Install esta dentro del rango de Tiempos`
                    }
                    objectToValidate.params.TrackingTime = TrackingTime + 1;
                    resolve({ name: NAME, proxy: true, result: result }); // proxy = false no envia postback al supplier
                }
            } else {
                const result = {
                    CreationDate: CreationDate,
                    DiffInstall: DiffInstall.asSeconds(),
                    TimeInstallMin: TimeInstallMin,
                    TimeInstall: TimeInstall,
                    Description: `No valido TimeInstall`
                }
                objectToValidate.params.TrackingTime = 0;
                resolve({ name: NAME, proxy: true, result: result }); // proxy = false no envia postback al supplier
            } 
        });
    }
};

module.exports = validator;
