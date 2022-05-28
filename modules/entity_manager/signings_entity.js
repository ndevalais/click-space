var moment = require('moment');
const config = require('../config');
var _ = require('lodash');
var db = require('../db/index');
var mongo = new require('mongodb');
let c = require("../constants");

const COLLECTION_NAME="Signings";

const structure = {
    //"OfferID": undefined,
    "OfferGUID": undefined,
    "CampaignClickGUID": undefined,
    "URL": undefined,
    "TestStatus": undefined,
    "Message": undefined,
    "CreationDate": undefined,
}

var saveSignings = async function (params, parsedUrl) {
    if(params){
        //trasforms passed signing as defined at structure  
        let signingStructure = _.clone(structure);  
        signingStructure.OfferID = _.get(params, 'param.offerid');
        signingStructure.OfferGUID = _.get(params, 'param.offerguid');
        signingStructure.CampaignClickGUID = _.get(params, 'param.insertedClickId');
        signingStructure.URL = parsedUrl;
        signingStructure.TestStatus = '';
        signingStructure.Message = '';
        //signingStructure.CampaignClickGUID = _.get(signing, 'insertedId').toHexString();
        signingStructure.CreationDate = new Date();
        signingStructure.ExpireAt = getExpirationDate();

        return db.connection().collection(COLLECTION_NAME).insertOne(signingStructure);    
    }else{
        throw Error('SigningsCanNotBeUndefined');
    }    
}

module.exports = {
    saveSignings: saveSignings
}

//Get the date + configured days in environment
function getExpirationDate(){    
    return new Date(moment().add(config.MONGO_DB_SIGNINGS_EXPIRATION_IN_DAYS ,'days'));
}
