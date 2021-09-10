var moment = require('moment');
const config = require('../../modules/config');
var _ = require('lodash');
var db = require('../db/index');
var mongo = new require('mongodb');
let c = require("../constants");

const COLLECTION_NAME="CampaignsClicks";
const structure = {
    //e"_id" : undefined, // ObjectId("5cd638bc170cc2dffb8f6fe8"),
    "OfferID" :undefined, // "5435345"
    "OfferGUID" :undefined, // "52D1099E-C15F-E911-B49E-2818780ED032",
    "SubPubID" :undefined, // "9909",
    "ClickID" :undefined, // "13123122",
    "CampaignHeadID" :undefined, // "13123122",
    "CampaignID" :undefined, // "13123122",
    "ExtraParams":{
        "tr_sub1" : undefined, // "",
        "tr_sub2" : undefined, // "",
        "tr_sub3" : undefined, // "",
        "tr_sub4" : undefined, // "",
        "p1": undefined,
        "p2": undefined,
        "p3": undefined,
        "p4": undefined,
        "p5": undefined
    },    
    "IDFA" :undefined, // "",
    "AndroidAdID" :undefined, // "",
    "AndroidID" :undefined, // "",
    //"MacAddress" :undefined, // "",
    //"IMEI" :undefined, // "",
    "OSInfo":{
        "OSfamilyVersion" :undefined, // "Mac OS X 10.14.4",
        "OSfamily" :undefined, // "Mac OS X",
        "OSmajor" :undefined, // 1000,
        "OSminor" :undefined, // 140,
        "OSpatch" :undefined, // 4,
        "OSversion" :undefined, // "10.14.4" 
    },
    "LocationInfo" : {
        "CountryCode" :undefined, // "AR",
        "CountryName" :undefined, // "Argentina",
        "CodeLanguage" : undefined, // "ES",
        "RegionName": undefined, //  
        "CityName": undefined, // 
        "Domain": undefined, // "telecom.com.ar",
        "Latitude": undefined, // -24.7859,
        "Longitude": undefined, // -65.411659,
        "VPNProxyType": undefined, // "",
        "VPNCountryCode": undefined, // "",
        "VPNCountryName":undefined, // "",
        "ControlIp": undefined, // "190.17.162.99"
        "IP2Long": undefined, 
    },
    "CreationDate": undefined, //ISODate("2019-05-11T02:51:40.043Z"),
    "ValidatorsResult":{
        //Dinamic responses by validators merged here
    }
};

var saveClick = async function (click) {
    if(click){
        //trasforms passed click as defined at structure        
        click.CreationDate = new Date();
        click.ExpireAt = getExpirationDate();

        return db.connection().collection(COLLECTION_NAME).insertOne(click);    
    }else{
        throw Error('ClickCanNotBeUndefined');
    }    
}

//Taken input from de controller and trasforms into DBSTructure to save
function createNewClickStructFromInput(params, context, validatorsResult){
    let clickStructure = _.clone(structure);
    const isFraude = _.get(context, 'offer.Campaign.isFraude', false);
    
    clickStructure.OfferID = _.get(context, 'offer.OfferID');
    clickStructure.OfferGUID = _.get(params, c.P_NAMES.click.OFFER_GUID);
    clickStructure.SubPubID = _.get(params, c.P_NAMES.click.SUBPUBID);
    clickStructure.SubPubHash = _.get(params, c.P_NAMES.click.SUBPUBHASH);
    clickStructure.p2hash = _.get(params, c.P_NAMES.click.P2HASH);
    clickStructure.ClickID = _.get(params, c.P_NAMES.click.CLICKID);
    clickStructure.CampaignClickGUID=_.get(params, c.P_NAMES.click.CAMPAIGN_CLICK_GUID); //TODO:Temporal, sacarlo por favor cuando se use el productivo
    
    clickStructure.Cost = _.get(context, 'offer.Cost');
    clickStructure.CampaignHeadID = _.get(context, 'offer.CampaignHead.CampaignHeadID');
    clickStructure.CampaignID = _.get(context, 'offer.Campaign.CampaignID');
    clickStructure.CampaignGUID = _.get(context, 'offer.Campaign.CampaignGUID');
    clickStructure.CampaignTypeID = _.get(context, 'offer.Campaign.CampaignTypeID');
    clickStructure.Revenue = _.get(context, 'offer.Campaign.Revenue');
    clickStructure.SupplierID = _.get(context, 'offer.Supplier.SupplierID');
    clickStructure.AccountManagerID = _.get(context, 'offer.Supplier.AccountManagerID');

    clickStructure.ExtraParams.tr_sub1 = _.get(params, c.P_NAMES.click.TR_SUB1);
    clickStructure.ExtraParams.tr_sub2 = _.get(params, c.P_NAMES.click.TR_SUB2);
    clickStructure.ExtraParams.tr_sub3 = _.get(params, c.P_NAMES.click.TR_SUB3);
    clickStructure.ExtraParams.tr_sub4 = _.get(params, c.P_NAMES.click.TR_SUB4);
    clickStructure.ExtraParams.p1 = _.get(params, c.P_NAMES.click.P1);
    clickStructure.ExtraParams.p2 = _.get(params, c.P_NAMES.click.P2);
    clickStructure.ExtraParams.p3 = _.get(params, c.P_NAMES.click.P3);
    clickStructure.ExtraParams.p4 = _.get(params, c.P_NAMES.click.P4);
    clickStructure.ExtraParams.p5 = _.get(params, c.P_NAMES.click.P5);

    clickStructure.IDFA = _.get(params, c.P_NAMES.click.IDFA);
    clickStructure.AndroidAdID = _.get(params, c.P_NAMES.click.ANDROID_ID);
    clickStructure.AndroidID = _.get(params, c.P_NAMES.click.ANDROID_ID);

    // clickStructure.OSInfo.OSfamilyVersion =  _.get(params, 'AdditionalUserAgentInfo.os.version');
    clickStructure.OSInfo.OSfamily =  _.get(params, 'AdditionalUserAgentInfo.os.family');
    clickStructure.OSInfo.OSmajor =  _.get(params, 'AdditionalUserAgentInfo.os.major');
    clickStructure.OSInfo.OSminor =  _.get(params, 'AdditionalUserAgentInfo.os.minor');
    clickStructure.OSInfo.OSpatch =  _.get(params, 'AdditionalUserAgentInfo.os.patch');
    clickStructure.OSInfo.OSversion =  _.get(params, 'AdditionalUserAgentInfo.os.version');

    clickStructure.LocationInfo.CountryCode =  _.get(params, 'AdditionalIPInfo.CountryCode');
    clickStructure.LocationInfo.CountryName =  _.get(params, 'AdditionalIPInfo.CountryName');
    clickStructure.LocationInfo.CodeLanguage =  _.get(params, 'AdditionalIPInfo.CodeLanguage');
    clickStructure.LocationInfo.RegionName =  _.get(params, 'AdditionalIPInfo.RegionName');
    clickStructure.LocationInfo.CityName =  _.get(params, 'AdditionalIPInfo.CityName');
    clickStructure.LocationInfo.Domain =  _.get(params, 'AdditionalIPInfo.Domain');
    clickStructure.LocationInfo.Latitude =  _.get(params, 'AdditionalIPInfo.Latitude');
    clickStructure.LocationInfo.Longitude = _.get(params, 'AdditionalIPInfo.Longitude');
    clickStructure.LocationInfo.ISP =  _.get(params, 'AdditionalIPInfo.ISP');
    clickStructure.LocationInfo.MobileBrand =  _.get(params, 'AdditionalIPInfo.MobileBrand');

    clickStructure.LocationInfo.VPNProxyType =  _.get(params, 'AdditionalProxyInfo.VPNProxyType');
    clickStructure.LocationInfo.VPNCountryCode =  _.get(params, 'AdditionalProxyInfo.VPNCountryCode');
    clickStructure.LocationInfo.VPNCountryName =  _.get(params, 'AdditionalProxyInfo.VPNCountryName');
    clickStructure.LocationInfo.ControlIp =  _.get(params, c.P_NAMES.click.SOURCE_IP);
    clickStructure.LocationInfo.IP2Long =  parseInt( _.get(params, 'AdditionalIPInfo.IP_No',0) );
    // Si es fraude agrego el UserAgent
    if (isFraude) clickStructure.ua = _.get(params, c.P_NAMES.click.USER_AGENT, '');
    
    /**
     *       IP: result.ip,
      IP_No: result.ip_no,
      CountryCode: result.country_short,
      CountryName: result.country_long,
      RegionName: result.region,
      CityName: result.city,
      Latitude: result.latitude,
      Longitude: result.longitude,
      ISP: result.isp,
      Domain: result.domain,
      MobileBrand: result.mobilebrand
     */
    //Ads validators result to document
    clickStructure.ValidatorsResult=validatorsResult;
    //TODO: Fill data
    return clickStructure;
}

var getClickByID = async function (id){
    //TODO: Esto es hacer las cosas bien
    try {
        let mongoID = mongo.ObjectID(id);
        return db.connection().collection("CampaignsClicks").findOne({'_id':mongoID});
    } catch (error) {
        return db.connection().collection("CampaignsClicks").findOne({'CampaignClickGUID':id});
    }
}

module.exports = {
    saveClick: saveClick,
    createNewClickStructFromInput: createNewClickStructFromInput,
    getClickByID: getClickByID
}

//Get the date + configured days in environment
function getExpirationDate(){    
    return new Date(moment().add(config.MONGO_DB_CLICK_EXPIRATION_IN_DAYS ,'days'));
}




