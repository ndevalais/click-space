/**
 * 
 * This event watcher is fire once every click is saved in Kibana, receives
 * the inserted click onfo as a param
 */
const c = require ('../../constants');
const conf = require ('../../config');
let OTotal = require('../campaign_clicks_total');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: conf.ELASTIC_SEARCH_URL })
let moment = require("moment");
var _ = require('lodash');
let counters = require("../../counters");

function postToElastic(click){
    return new Promise(function(resolve, reject){
        click.id = click._id;
        click.Event = 'click';
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
            index: conf.ELASTIC_DEBUG_INDEX_NAME,
            // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
            body: click
          }).catch(function(err){
              console.log(err);
              reject(err);
          }).then(function(){
              resolve();
          });
    });
}


module.exports = {
    name: c.EVENTS_KEY_NAMES.NEW_DEBUG_CREATED,
    function: function(param){
        let click = param.ops[0];
        click.Advertiser = _.get(param, "offer.Advertiser.Advertiser",'');  
        click.AdvertiserID = _.get(param, "offer.Advertiser.AdvertiserID",0);  
        click.Campaign = _.get(param, "offer.Campaign.Campaign",'');  
        //click.Countrys = _.get(param, "offer.Campaign.Countrys",'');  
        //click.Languages = _.get(param, "offer.Campaign.Languages",'');  
        //click.PackageName = _.get(param, "offer.CampaignHead.PackageName",'');  
        click.Supplier = _.get(param, "offer.Supplier.Supplier",'');  
        click.SupplierID = _.get(param, "offer.Supplier.SupplierID",0);  
        click.TrackingCost = { CountTrackingProxy: 0, Cost: 0, Revenue: 0, Profit: 0 };
        
        //if (conf.REPORT_TO_ELASTIC_SEARCH === "true") {
        //    postToElastic(click);
        //}
    }
};