/********************
    VALIDO que solo se registre el install 1 vez.
    - El install debe existir 1 vez por cada click.
    - Si ya existe un click entonces, dispara el evento de registro de eventos

*/
const NAME = "Proxy";
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

            const TrackingCount = _.get(objectToValidate, `offer.Totals.Offers[${OfferID}].installs[${simpleDateYMD}].T`, 0);
            //const CantClicksCount = _.get(objectToValidate,`offer.Totals.Offers[${OfferID}].clicks[${simpleDateYMD}].T`,0);
            const CantTrackingCount = _.get(objectToValidate, `offer.Totals.Offers[${OfferID}].installs[${simpleDateYMD}].TrackingProxy`, 0);

            const DailyQuantity = _.get(contextToValidateWith, "offer.Campaign.DailyQuantity", 0);
            const DailyAmount = _.get(contextToValidateWith, "offer.Campaign.DailyAmount", 0);
            const DailyQuantityHead = _.get(contextToValidateWith, "offer.CampaignHead.DailyQuantity", 0);
            const DailyAmountHead = _.get(contextToValidateWith, "offer.CampaignHead.DailyAmount", 0);

            //const ClickCountCampaignHead = _.get(contextToValidateWith,`offer.Totals.clicks[${simpleDateYMD}].T`,0);
            //const InstallCountCampaignHead = _.get(contextToValidateWith,`offer.Totals.installs[${simpleDateYMD}].T`,0);
            //const ClickCountCampaign = _.get(contextToValidateWith,`offer.Totals.Campaigns[${CampaignID}].clicks[${simpleDateYMD}].T`,0);
            const InstallCountCampaign = _.get(contextToValidateWith, `offer.Totals.Campaigns[${CampaignID}].installs[${simpleDateYMD}].T`, 0);
            const TotalRevenueCountCampaign = _.get(contextToValidateWith, `offer.Totals.Campaigns[${CampaignID}].installs[${simpleDateYMD}].TotalRevenue`, 0);

            const proxy = _.get(objectToValidate, "offer.Proxy", 0);
            const MargenDaily = parseFloat(_.get(config, "MARGEN_DAILY", 1));
            var TrackingProxy = false; // false no envia postback al supplier

            const result = {
                proxy: proxy,
                MargenDaily: MargenDaily,
                CantTrackingCount: CantTrackingCount,
                InstallCountCampaign: InstallCountCampaign,
                TotalRevenueCountCampaign: TotalRevenueCountCampaign,
                TrackingCount: TrackingCount
            }

            // Valido si hay porcentaje de Proxy en la Oferta para ver si hay que convertir
            if (proxy > 0) {

                if ((CantTrackingCount * 100 / (TrackingCount + 1)) < proxy) TrackingProxy = true;
                if (CantTrackingCount == 0) TrackingProxy = true;

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
                if (objectToValidate.params.TrackingProxy == false) TrackingProxy == false;
                objectToValidate.params.TrackingProxy = TrackingProxy;

                resolve({ name: NAME, proxy: TrackingProxy, result: result }); // proxy = false no envia postback al supplier
            } else {
                resolve({ name: NAME, proxy: true, result: result }); // proxy = false no envia postback al supplier
            }
        });
    }
};

module.exports = validator;
