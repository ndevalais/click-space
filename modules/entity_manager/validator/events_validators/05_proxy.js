/********************
    VALIDO que solo se registre el event 1 vez.
    - El install debe existir 1 vez por cada click.

*/
const NAME = "ProxyEvent";
const log = require('../../../log');
let config = require("../../../config");
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
            const OfferID = _.get(objectToValidate, "offer.OfferID");
            const simpleDateYMD = moment().format('YYYYMMDD');

            // Obtengo CampaignType y valido solo si es CP2 (para campañas con conversion por eventos)
            const CampaignTypeID = _.get(objectToValidate, "offer.CampaignHead.CampaignTypeID",'');
            const AdvertiserID = _.get(objectToValidate, "offer.Advertiser.AdvertiserID", 0);
            const DailyQuantity = _.get(contextToValidateWith, "offer.Campaign.DailyQuantity", 0);
            const DailyAmount = _.get(contextToValidateWith, "offer.Campaign.DailyAmount", 0);
            const DailyQuantityHead = _.get(contextToValidateWith, "offer.CampaignHead.DailyQuantity", 0);
            const DailyAmountHead = _.get(contextToValidateWith, "offer.CampaignHead.DailyAmount", 0);

            const InstallCountCampaign = _.get(contextToValidateWith, `offer.Totals.Campaigns[${CampaignID}].installs[${simpleDateYMD}].T`, 0);
            const TotalRevenueCountCampaign = _.get(contextToValidateWith, `offer.Totals.Campaigns[${CampaignID}].installs[${simpleDateYMD}].TotalRevenue`, 0);

            const MargenDaily = parseFloat(_.get(config, "MARGEN_DAILY", 1));

            const event = _.get(objectToValidate, "params.event", '').toUpperCase();
            const event1 = _.get(objectToValidate, "offer.Campaign.eventsName1", '').toUpperCase();
            const event2 = _.get(objectToValidate, "offer.Campaign.eventsName2", '').toUpperCase();
            const event3 = _.get(objectToValidate, "offer.Campaign.eventsName3", '').toUpperCase();

            let proxy = ''; //_.get(objectToValidate, "offer.Proxy", 0);

            // Evento ya generado en el install
            let existingEventInstall = _.get(objectToValidate, `install.events[${event}].T`, 0);
            var TrackingProxy = false; 
            let TrackingCount = 0; //_.get(objectToValidate, `offer.Totals.Offers[${OfferID}].installs[${simpleDateYMD}].T`, 0);
            let CantTrackingCount = 0; //_.get(objectToValidate, `offer.Totals.Offers[${OfferID}].installs[${simpleDateYMD}].TrackingProxy`, 0);

            TrackingCount = _.get(objectToValidate, `offer.Totals.Offers[${OfferID}].events[${event}][${simpleDateYMD}].T`, 0);
            CantTrackingCount = _.get(objectToValidate, `offer.Totals.Offers[${OfferID}].events[${event}][${simpleDateYMD}].TrackingProxy`, 0);

            // Obtengo el proxy segun el evento
            //if (event==event1) proxy = _.get(objectToValidate, "offer.Campaign.eventProxy1", 0);
            //if (event==event2) proxy = _.get(objectToValidate, "offer.Campaign.eventProxy2", 0);
            //if (event==event3) proxy = _.get(objectToValidate, "offer.Campaign.eventProxy3", 0);
            if (proxy==0) proxy = _.get(objectToValidate, "offer.Proxy", 0);

            // CantTrackingCount     _.get(objectToValidate, `offer.Totals.Offers[${OfferID}].events[${event}][${simpleDateYMD}].TrackingProxy`, 0);
            // TrackingCount         _.get(objectToValidate, `offer.Totals.Offers[${OfferID}].events[${event}][${simpleDateYMD}].T`, 0);

            const result = {
                proxy: proxy,
                event: event,
                MargenDaily: MargenDaily,
                CantTrackingCount: CantTrackingCount,
                InstallCountCampaign: InstallCountCampaign,
                TotalRevenueCountCampaign: TotalRevenueCountCampaign,
                TrackingCount: TrackingCount
            }

            // Valido si hay porcentaje de Proxy en la Oferta para ver si hay que convertir y si la campa es por evento CP2
            if (proxy > 0 && CampaignTypeID == 'CP2') {

                if ((CantTrackingCount * 100 / (TrackingCount + 1)) < proxy) TrackingProxy = true;
                if (CantTrackingCount == 0) TrackingProxy = true;
                // Si el Evento ya ingreso en el install no lo genero
                if (existingEventInstall > 0) TrackingProxy = false;

                // COMO VALIDO EL DAILY EN EL EVENTO
                if (CantTrackingCount > 0 && TrackingProxy) {
                    if (DailyQuantity >= 1) {
                        if (InstallCountCampaign > (DailyQuantity * MargenDaily)) TrackingProxy = false;
                    }
                    if (DailyAmount >= 1) {
                        if (TotalRevenueCountCampaign > (DailyAmount * MargenDaily)) TrackingProxy = false;
                    }
                }

                if (CantTrackingCount > 0 && TrackingProxy) {
                    if (DailyQuantityHead >= 1) {
                        if (InstallCountCampaign > (DailyQuantityHead * MargenDaily)) TrackingProxy = false;
                    }
                    if (DailyAmountHead >= 1) {
                        if (TotalRevenueCountCampaign > (DailyAmountHead * MargenDaily)) TrackingProxy = false;
                    }
                }

                //objectToValidate.TrackingProxy = TrackingProxy;
                if (objectToValidate.params.TrackingProxyEvent == false) TrackingProxy == false;
                // Si el Advertiser es 1 (LAIKAD) paso la validacion
                if (AdvertiserID ==1 ) TrackingProxy == true;
                objectToValidate.params.TrackingProxyEvent = TrackingProxy;
                
                resolve({ name: NAME, proxy: TrackingProxy, result: result }); // proxy = false no envia postback al supplier
            } else {
                objectToValidate.params.TrackingProxyEvent = false;
                resolve({ name: NAME, proxy: false, result: result }); // proxy = false no envia postback al supplier
            }
        });
    }
};

module.exports = validator;
