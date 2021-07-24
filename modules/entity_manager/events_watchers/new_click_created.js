/**
 * 
 * This event watcher is fire once every click is saved, receives
 * the inserted click onfo as a param
 */
const c = require ('../../../modules/constants');
const conf = require ('../../../modules/config');
let OTotal = require('../campaign_clicks_total');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: conf.ELASTIC_SEARCH_URL })
let moment = require("moment");
var _ = require('lodash');
let counters = require("../../counters");

//Registra totales para una campana
function registerTotals(click, offer){
    OTotal.addOneClick(click, offer);
}

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
            index: conf.ELASTIC_CLICKS_INDEX_NAME,
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

function addOneToGlobalCouter(){
    counters.addOneClick();
}

module.exports = {
    name: c.EVENTS_KEY_NAMES.NEW_CLICK_CREATED,
    function: function(param){
        let click = param.ops[0];
        let offer = _.get(param, "offer",'');  
        click.Advertiser = _.get(param, "offer.Advertiser.Advertiser",'');  
        click.AdvertiserID = _.get(param, "offer.Advertiser.AdvertiserID",0);  
        click.Campaign = _.get(param, "offer.Campaign.Campaign",'');
        click.Supplier = _.get(param, "offer.Supplier.Supplier",'');  
        click.SupplierID = _.get(param, "offer.Supplier.SupplierID",0);  
        click.AccountManagerID = _.get(param, "offer.Supplier.AccountManagerID",0);  
        click.AccountManagerIDAdv = _.get(param, "offer.Advertiser.AccountManagerID",0);  
        
        //click.TrackingCost = { CountTrackingProxy: 0, Cost: 0, Revenue: 0, Profit: 0 };
        
        //When this watcher is triggered we calculate totals
        registerTotals(click, offer);
        if(conf.REPORT_TO_ELASTIC_SEARCH==="true"){
            postToElastic(click);
        } 
        addOneToGlobalCouter();
    }
};