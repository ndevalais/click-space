/********************
    VALIDO que solo se registre el install 1 vez.
    - El install debe existir 1 vez por cada click.
    - Si ya existe un click entonces, dispara el evento de registro de eventos
*/
const NAME = "KPI Install";
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
            const CampaignID = _.get(objectToValidate, "offer.Campaign.CampaignID");
            const AdvertiserID = _.get(objectToValidate, "offer.Advertiser.AdvertiserID", 0);
            const SupplierID = _.get(objectToValidate, "offer.Supplier.SupplierID"); 
            const AccountManagerID = _.get(objectToValidate, "offer.Supplier.AccountManagerID"); 

            const OfferID = _.get(objectToValidate, "offer.OfferID");
            const ControlIP = _.get(objectToValidate, "click.LocationInfo.ControlIp");
            const simpleDateYMD = moment().format('YYYYMMDD');
            const SubPubID = _.get(objectToValidate, "click.SubPubID");
            const SubPubHash = _.get(objectToValidate, "click.SubPubHash");
            const p2hash = _.get(objectToValidate, "click.p2hash", "");
            const p2 = _.get(objectToValidate, "click.ExtraParams.p2", "");
            const Event = _.get(contextToValidateWith, "event", 'installs');
            const KPIInstall = parseFloat( _.get(objectToValidate, "offer.Campaign.LeadsGoal",0) );
            const KPIEvents = parseFloat( _.get(objectToValidate, "offer.Campaign.EventsGoal",0) );
            const offer = _.get(objectToValidate, "offer");

            // Obtengo Eventos por Campaign SubPubID Totales
            let KPITrackingEvent = _.get(objectToValidate,`offer.Totals.Campaigns[${CampaignID}].SubPub[${SubPubHash}].events.T`,0);
            if (KPITrackingEvent==0) KPITrackingEvent = _.get(objectToValidate,`KPITrackingEvent`,0);

            // Obtengo Install por Campaign SubPubID y por Fecha
            let KPITrackingInstall = _.get(objectToValidate,`offer.Totals.Campaigns[${CampaignID}].SubPub[${SubPubHash}].installs[${simpleDateYMD}].T`,0);
            if (KPITrackingInstall==0) KPITrackingInstall = _.get(objectToValidate,`KPITrackingInstall`,0);
            let click = _.get(objectToValidate, "click");
            let install = _.get(objectToValidate, "install");

            if (KPIInstall > 0 && KPIEvents > 0 && AdvertiserID != 1) {
                const EventsByInstall = (1 * KPIEvents / KPIInstall );

                // Calculo los Eventos por click del SubPubID
                if (KPITrackingInstall > 0 ) {
                    // SET @CountEventsByInstall = (1 * CAST(@KPITrackingEvent AS DECIMAL(10,2)) / CAST(@KPITrackingInstall AS DECIMAL(10,2)) );
                    const CountEventsByInstall = (1 * (KPITrackingEvent + 1) / KPITrackingInstall);
                    
                    // --Valido se la cantidad de install es la que tiene la campaña para validar
				    if ( KPITrackingInstall > KPIInstall ) {

                        const result = {
                            KPIInstall: KPIInstall,
                            KPIEvents: KPIEvents,
                            KPITrackingInstall: KPITrackingInstall,
                            KPITrackingEvent: KPITrackingEvent,
                            EventsByInstall: EventsByInstall,
                            CountEventsByInstall: CountEventsByInstall,
                            Description: `Comparo los Eventos de la Campaña con los ingresados del subpub ${EventsByInstall} > ${CountEventsByInstall}`
                        }

                        if (EventsByInstall > CountEventsByInstall ) {
                            // Pauso SubPubbID
                            // Busco y/o Agrego SubPubbID por OfferID  - BlackList, 
                            
                            const blacklist = { 
                                SubPubID: SubPubID, 
                                OfferID: OfferID, 
                                AdvertiserID: AdvertiserID, 
                                CampaignID: CampaignID, 
                                SupplierID: SupplierID, 
                                AccountManagerID: AccountManagerID, 
                                ListType: 'BL', 
                                blackListReason: 'Low Event KPI', 
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

                            const blacklist = { 
                                SubPubID: SubPubID, 
                                OfferID: OfferID, 
                                AdvertiserID: AdvertiserID, 
                                CampaignID: CampaignID, 
                                SupplierID: SupplierID, 
                                AccountManagerID: AccountManagerID, 
                                ListType: 'BL', 
                                blackListReason: 'Low Event KPI', 
                                Status: false,
                                offer: offer, 
                                SubPubHash: SubPubHash,
                                p2hash: p2hash,
                                SubPubID: SubPubID,
                                p2: p2
                            };
                            entityManager.emitEvent(c.EVENTS_KEY_NAMES.NEW_BLACKLIST_REGISTERED, blacklist);                        
                            // Borro BlackList SubPubbID por OfferID , 
                            resolve({ name: NAME, proxy: true, blacklist: blacklist, result: result }); // proxy = false no envia postback al supplier
                        }
                    } else {

                        const result = {
                            KPIInstall: KPIInstall,
                            KPIEvents: KPIEvents,
                            KPITrackingInstall: KPITrackingInstall,
                            EventsByInstall: EventsByInstall,
                            CountEventsByInstall: CountEventsByInstall,
                            Description: `Comparo los Eventos de la Campaña con los ingresados del subpub ${EventsByInstall} > ${CountEventsByInstall}`
                        }

                        resolve({ name: NAME, proxy: true, result: result });
                    }
                } else {
                    const result = {
                        KPIInstall: KPIInstall,
                        KPIEvents: KPIEvents,
                        KPITrackingInstall: KPITrackingInstall,
                        EventsByInstall: EventsByInstall,
                        Description: `Install por SubPubID = 0 `
                    }
                    resolve({ name: NAME, proxy: true, result: result });
                }
            } else {
                const result = {
                    KPIInstall: KPIInstall,
                    KPIEvents: KPIEvents,
                    KPITrackingInstall: KPITrackingInstall,
                    Description: `No valido KPIInstall`
                }
                resolve({ name: NAME, proxy: true, result: result }); // proxy = false no envia postback al supplier
            }
        });
    }
};

module.exports = validator;