/**
 * 
 * This event watcher is fire once every click is saved, receives
 * the inserted click onfo as a param
 */

/*
- Llamar a la URL de postback, de acuerdo a un calculo (Proxy de la Oferta)
- Oferta + Evento cuantas instalaciones para esta fecha.
*/
const c = require ('../../constants');
const conf = require ('../../../modules/config');
let OTotal = require('../campaign_clicks_total');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: conf.ELASTIC_SEARCH_URL })
let moment = require("moment");
var _ = require('lodash');
let counters = require("../../counters");

function registerInstallTotals(install, offer){
    OTotal.addOneInstall(install, offer);
    addOneToGlobalCouter();
}

function addOneToGlobalCouter(){
    counters.addOneInstall();
}

function postToElastic(click){
    return new Promise(function(resolve, reject){
        click.id = click._id;
        click.Event = 'install';
        delete click['_id'];
        click.CreationDate = moment().format();
        if(click.LocationInfo){
            let lat = _.get(click,"LocationInfo.Latitude", 0);
            let lon = _.get(click,"LocationInfo.Longitude", 0);
            lat = lat == "?" ? 0: lat;
            lon = lon == "?" ? 0: lon;
            click.GeoPoint= {
                lat:  lat,
                lon : lon
            }
        }
        client.index({
            index: conf.ELASTIC_INSTALLS_INDEX_NAME,
            // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6 ELASTIC_INSTALLS_INDEX_NAME
            body: click
          }).catch(function(err){
              console.log('ELASTIC', err);
              reject(err);
          }).then(function(){
              resolve();
          });
    });
}

module.exports = {
    name: c.EVENTS_KEY_NAMES.NEW_INSTALL_REGISTERED,
    function: function(install){              
        let click = _.get(install,"context.click");
        let offer = _.get(install, "context.offer",'');  
        click.install = _.get(install,"context.params");
        click.Advertiser = _.get(install, "context.offer.Advertiser.Advertiser",'');
        click.AdvertiserID = _.get(install, "context.offer.Advertiser.AdvertiserID",0);
        click.Campaign = _.get(install, "context.offer.Campaign.Campaign",'');
        //click.Countrys = _.get(install, "context.offer.Campaign.Countrys",'');
        //click.Languages = _.get(install, "context.offer.Campaign.Languages",'');
        //click.PackageName = _.get(install, "context.offer.CampaignHead.PackageName",'');
        click.Supplier = _.get(install, "context.offer.Supplier.Supplier",'');
        click.SupplierID = _.get(install, "context.offer.Supplier.SupplierID",0);
        
        const TrackingProxy = _.get(install, "context.params.TrackingProxy", false);
        const CampaignTypeID = _.get(install, "context.click.CampaignTypeID",'');
        let Revenue = parseFloat(_.get(install, "context.click.Revenue", 0));
        let Cost = parseFloat(_.get(install, "context.click.Cost"));
        let Profit = 0;
        let CountTrackingProxy = 1;
        if (!TrackingProxy) {
            CountTrackingProxy = 0;
            Cost = 0;
        }
        if (CampaignTypeID == 'CPC' || CampaignTypeID == 'CP2' ) {
            Revenue = 0;
            Cost = 0;
            Profit = 0;
        } else {
            if (Revenue > Cost) Profit = Revenue - Cost;
        }
        click.TrackingCost = {
            CountTrackingProxy: CountTrackingProxy,
            Cost: Cost,
            Revenue: Revenue,
            Profit: Profit
        };

        //When this watcher is triggered we calculate totals
        registerInstallTotals(install, offer);
        if(conf.REPORT_TO_ELASTIC_SEARCH==="true"){
            postToElastic(click);
        } 
    }
};