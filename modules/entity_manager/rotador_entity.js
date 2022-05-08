var moment = require('moment');
const config = require('../../modules/config');
var _ = require('lodash');
var db = require('../db/index');
var mongo = new require('mongodb');
let c = require("../constants");

const COLLECTION_NAME="Rotador";
const structure = {
    "OfferID": undefined,
    "OfferGUID": undefined,
    "Offer": undefined,
    "AdvertiserID": undefined,
    "Advertiser" : "",
    "CampaignID": undefined,
    "Campaign": undefined,
    "SupplierID": undefined,
    "Supplier": undefined,
    "RotadorOfferID": undefined,
    "RotadorOfferGUID": undefined,
    "RotadorOffer": undefined,
    "RotadorAdvertiserID": undefined,
    "RotadorAdvertiser" : "",
    "RotadorCampaignID": undefined,
    "RotadorCampaign": undefined,
    "RotadorSupplierID": undefined,
    "RotadorSupplier": undefined,
    "SubPubHash": undefined,
    "SubPubID": undefined,
    "CampaignClickGUID": undefined,
    "Rotador": undefined,
    "Reason": "",
    "CreationDate": undefined,
}

var saveRotador = async function (rotador) {
    if(rotador){
        //trasforms passed rotador as defined at structure  
        let rotadorStructure = _.clone(structure);  
        rotadorStructure.OfferID = _.get(rotador, 'SourceOffer.OfferID');
        rotadorStructure.OfferGUID = _.get(rotador, 'SourceOffer.OfferGUID');
        rotadorStructure.Offer = _.get(rotador, 'SourceOffer.Offer');
        rotadorStructure.AdvertiserID = _.get(rotador, 'SourceOffer.Advertiser.AdvertiserID');
        rotadorStructure.Advertiser = _.get(rotador, 'SourceOffer.Advertiser.Advertiser');
        rotadorStructure.CampaignID = _.get(rotador, 'SourceOffer.Campaign.CampaignID');
        rotadorStructure.Campaign = _.get(rotador, 'SourceOffer.Campaign.Campaign');
        rotadorStructure.SupplierID = _.get(rotador, 'SourceOffer.Supplier.SupplierID');
        rotadorStructure.Supplier = _.get(rotador, 'SourceOffer.Supplier.Supplier');
        rotadorStructure.RotadorOfferID = _.get(rotador, 'offer.OfferID');
        rotadorStructure.RotadorOfferGUID = _.get(rotador, 'offer.OfferGUID');
        rotadorStructure.RotadorOffer = _.get(rotador, 'offer.Offer');
        rotadorStructure.RotadorAdvertiserID = _.get(rotador, 'offer.Advertiser.AdvertiserID');
        rotadorStructure.RotadorAdvertiser = _.get(rotador, 'offer.Advertiser.Advertiser');
        rotadorStructure.RotadorCampaignID = _.get(rotador, 'offer.Campaign.CampaignID');
        rotadorStructure.RotadorCampaign = _.get(rotador, 'offer.Campaign.Campaign');
        rotadorStructure.RotadorSupplierID = _.get(rotador, 'offer.Supplier.SupplierID');
        rotadorStructure.RotadorSupplier = _.get(rotador, 'offer.Supplier.Supplier');
        rotadorStructure.SubPubHash = _.get(rotador, 'ops[0].SubPubHash');
        rotadorStructure.SubPubID = _.get(rotador, 'ops[0].SubPubID');
        rotadorStructure.CampaignClickGUID = _.get(rotador, 'insertedId').toHexString();
        rotadorStructure.Rotador = _.get(rotador, 'ops[0].ValidatorsResult.name');
        rotadorStructure.Reason = _.get(rotador, 'ops[0].ValidatorsResult.rotatorReason');
        rotadorStructure.CreationDate = new Date();
        rotadorStructure.ExpireAt = getExpirationDate();

        return db.connection().collection(COLLECTION_NAME).insertOne(rotadorStructure);    
    }else{
        throw Error('RotadorCanNotBeUndefined');
    }    
}

module.exports = {
    saveRotador: saveRotador
}

//Get the date + configured days in environment
function getExpirationDate(){    
    return new Date(moment().add(config.MONGO_DB_ROTADOR_EXPIRATION_IN_DAYS ,'days'));
}
