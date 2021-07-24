var moment = require('moment');
const config = require('../config');
const COLLECTION_NAME = "AppsNames";
var _ = require('lodash');
var db = require("../db");

const structure = {
    "CountryCode": undefined, //"AU",
    "Device": undefined, //"IOS",
    "AppNameID": undefined, //16830,
    "AppName": undefined, //"Survival Island 1&2",
    "AppID": undefined, //"747403894"
    "BlackList": {
        "Advertisers": [undefined, undefined],
        "Campaigns": [undefined, undefined],
        "Offers": [undefined, undefined]
    },
    "WhiteList": {
        "Advertisers": [undefined, undefined],
        "Campaigns": [undefined, undefined],
        "Offers": [undefined, undefined]
    }
};

function createNewAppsNamesStructFromInput(data, context, validatorsResult) {
    let AppsNamesStructure = _.clone(structure);
    AppsNamesStructure.CountryCode = _.get(params, 'CountryCode');
    AppsNamesStructure.Device = _.get(params, 'Device');
    AppsNamesStructure.AppNameID = _.get(params, 'AppNameID');
    AppsNamesStructure.AppName = _.get(params, 'AppName');
    AppsNamesStructure.AppID = _.get(params, 'AppID');
    //AppsNamesStructure.BlackList.AccountManager = _.get(params, 'BlackList.Advertisers');
    //AppsNamesStructure.BlackList.Campaigns = _.get(params, 'BlackList.Campaigns');
    //AppsNamesStructure.BlackList.Offers = _.get(params, 'BlackList.Offers');
    //AppsNamesStructure.WhiteList.AccountManager = _.get(params, 'WhiteList.Advertisers');
    //AppsNamesStructure.WhiteList.Campaigns = _.get(params, 'WhiteList.Campaigns');
    //AppsNamesStructure.WhiteList.Offers = _.get(params, 'WhiteList.Offers');
    //Ads validators result to document
    clickStructure.ValidatorsResult = validatorsResult;
    //TODO: Fill data
    return clickStructure;
}
var saveAppsNames = async function (AppsNames) {
    if (data) {
        //trasforms passed AppsNames as defined at structure
        var AppsNames = getAppsNamesASDBStructure(data);
        AppsNames.CreationDate = new Date();
        // AppsNames.ExpireAt = getExpirationDate(); SE AGREGO SI QUIERO QUE EL DOCUMENTO EXIRE !!

        return db.connection().collection("AppsNames").insert(AppsNames);
    } else {
        throw Error('AppsNamesCanNotBeUndefined');
    }
}

var getAppsNames = async function (ListType, AdvertiserID, CampaignID, OfferID) {
    return db.connection().collection("AppsNames").find(
        {
            "ListType": ListType, "StatusID": "A", "$or": [
                { "AdvertiserID": AdvertiserID },
                { "CampaignID": CampaignID },
                { "OfferID": OfferID }]
        }
    ).count();
}

var getAppsNamesCountry = async function (CountryCode, DeviceID, BlackList) {

    //var n = 100; //await db.connection().collection(COLLECTION_NAME).find({ "CountryCode": CountryCode }).count()
    /*var r = Math.floor(Math.random() * 100 );       
    var n = await db.connection().collection(COLLECTION_NAME).find(
        { 
            "CountryCode": CountryCode
        } 
    ).limit(20).skip(r);
    //,"AppID": {$nin: ["591560124", "com.grindrapp.android"] } 
    */
    return new Promise(function (resolve, reject) {
        let match = { 
            "CountryCode": CountryCode, 
            "Device": DeviceID
          //  "AppID": { $nin: BlackList } 
        };
        if(BlackList.length > 0){
            match.AppID ={ "$nin": BlackList } ;
        }
        //TODO: Poner esto en una cache
        db.connection().collection(COLLECTION_NAME).aggregate(
            [
                { 
                    $match: match
                },
                { $sample: { size: 20 } }
            ], function (err, data) {
                let doc;
                //Warning, this could for reasons bring more that one doc.
                data.forEach(function (result) {
                    doc = result;
                }).then(function () {
                    resolve(doc);
                });
            }
        );
    });
}

var getAppsNamesSubPub = async function (ListType, AdvertiserID, CampaignID, OfferID, SubPubID, ControlIP) {
    return db.connection().collection("AppsNames").find(
        {
            "ListType": ListType, "StatusID": "A", "$or": [
                { "AdvertiserID": AdvertiserID, "SubPubID": SubPubID },
                { "CampaignID": CampaignID, "SubPubID": SubPubID },
                { "OfferID": OfferID, "SubPubID": SubPubID },
                { "AdvertiserID": AdvertiserID, "SubPubID": ControlIP },
                { "CampaignID": CampaignID, "SubPubID": ControlIP },
                { "OfferID": OfferID, "SubPubID": ControlIP }]
        }
    ).count();
}

module.exports = {
    getAppsNames: getAppsNames,
    getAppsNamesCountry: getAppsNamesCountry,
    getAppsNamesSubPub: getAppsNamesSubPub,
    createNewAppsNamesStructFromInput: createNewAppsNamesStructFromInput
}

//Get the date + configured days in environment
function getExpirationDate() {
    return new Date(moment().add(config.MONGO_DB_CLICK_EXPIRATION_IN_DAYS, 'days'));
}
