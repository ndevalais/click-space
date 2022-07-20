/**
 * This is fired when and event is registered through an installed click
 */
const c = require('../../constants');
const conf = require('../../../modules/config');
let OTotal = require('../campaign_clicks_total');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: conf.ELASTIC_SEARCH_URL })
let moment = require("moment");
var _ = require('lodash');
var utils = require('../utils/index');

function registerEventsTotals(events, offer) {
    OTotal.addOneEvents(events, offer);// .addOneInstall(install);
}

function postToElastic(click) {
    return new Promise(function (resolve, reject) {
        click.id = click._id;
        click.Event = 'event';
        delete click['_id'];
        click.CreationDate = moment().format();
        if (click.LocationInfo) {
            let lat = _.get(click, "LocationInfo.Latitude", 0);
            let lon = _.get(click, "LocationInfo.Longitude", 0);
            lat = lat == "?" ? 0 : lat;
            lon = lon == "?" ? 0 : lon;
            click.GeoPoint = {
                lat: lat,
                lon: lon
            }
        }
        client.index({
            index: conf.ELASTIC_INSTALLS_INDEX_NAME,
            // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6 ELASTIC_EVENTS_INDEX_NAME
            body: click
        }).catch(function (err) {
            console.log(err);
            reject(err);
        }).then(function () {
            resolve();
        });
    });
}

module.exports = {
    name: c.EVENTS_KEY_NAMES.NEW_EVENT_ARRIVED,
    function: async function (events) {
        let click = events.context.click;
        let offer = _.get(events, "context.offer",'');

        click.events = events.context.params;
        click.Advertiser = _.get(events, "context.offer.Advertiser.Advertiser", '');
        click.AdvertiserID = _.get(events, "context.offer.Advertiser.AdvertiserID", 0);
        click.Campaign = _.get(events, "context.offer.Campaign.Campaign", '');
        //click.Countrys = _.get(events, "context.offer.Campaign.Countrys", '');
        //click.Languages = _.get(events, "context.offer.Campaign.Languages", '');
        //click.PackageName = _.get(events, "context.offer.CampaignHead.PackageName", '');
        click.Supplier = _.get(events, "context.offer.Supplier.Supplier", '');
        click.SupplierID = _.get(events, "context.offer.Supplier.SupplierID", 0);
    
        const TrackingProxy = _.get(events, "context.params.TrackingProxyEvent", false); // DEBO CARGAR ESTE PARAMETRO

        // Obtengo nombre del evento
        const event = _.get(events, "context.params.event",'').toUpperCase();
        const existingEventInstall = _.get(events, `context.install.events[${event}].T`, 0);
        click.TrackingCost = await utils.eventCost(event, TrackingProxy, offer, existingEventInstall);

        /**
            C.[eventsName1] AS [Campaign.eventsName1],
            C.[eventPayOut1] AS [Campaign.eventPayOut1],
            C.[eventCost1] AS [Campaign.eventCost1],
            C.[eventProxy1] AS [Campaign.eventProxy1],
            C.[eventOptimizarInstall1] AS [Campaign.eventOptimizarInstall1],
            C.[eventOptimizarEvent1] AS [Campaign.eventOptimizarEvent1],
            C.[eventsName2] AS [Campaign.eventsName2],
            C.[eventPayOut2] AS [Campaign.eventPayOut2],
            C.[eventCost2] AS [Campaign.eventCost2],
            C.[eventProxy2] AS [Campaign.eventProxy2],
            C.[eventOptimizarEvent11] AS [Campaign.eventOptimizarEvent11],
            C.[eventOptimizarEvent2] AS [Campaign.eventOptimizarEvent2],
            C.[eventsName3] AS [Campaign.eventsName3],
            C.[eventPayOut3] AS [Campaign.eventPayOut3],
            C.[eventCost3] AS [Campaign.eventCost3],
            C.[eventProxy3] AS [Campaign.eventProxy3],
            C.[eventOptimizarEvent21] AS [Campaign.eventOptimizarEvent21],
            C.[eventOptimizarEvent3] AS [Campaign.eventOptimizarEvent3],
         */

 
        //When this watcher is triggered we calculate totals
        registerEventsTotals(events, offer);
        //if (conf.REPORT_TO_ELASTIC_SEARCH === "true") {
        //    postToElastic(click);
        //}
    }
};