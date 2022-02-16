var _ = require('lodash');
var db = require('../db/index');
const COLLECTION_NAME = 'Processes';

//Example structure
const structure = {
    "PublisherID": undefined,
    "OfferID": undefined,
    "OfferGUID": undefined,
    "ClickID": undefined,
    "SubPubID": undefined,
    "SubPubHash": undefined,
    "CampaignClickGUID": undefined,
    "PostBackURL": undefined,
    "CreationDate": undefined
}

var insertPostBackURL = async function (data) {
    try {
        db.connection().collection('PostBack').insertOne(
            data
        );
    } catch (error) {
        log(`Error ${error} rows`);
    }
}

module.exports = {
    insertPostBackURL
}