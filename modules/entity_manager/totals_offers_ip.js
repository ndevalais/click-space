/*
Para contar si vienen muchos clicks de la misma IP, se mandan al rotador.
*/
var _ = require('lodash');
var db = require('../db/index');
const COLLECTION_NAME = 'OffersIPs';


//Example structure
const structure = {    
    "OfferGUID" : undefined , // "52D1099E-C15F-E911-B49E-2818780ED032",
    "OfferID" : undefined, // "5435345"
    "IP2Long" :  undefined, 
    "IP" :  undefined, 
    "TotalClick": undefined, //55,
    "TotalTracking": undefined,
};


var addOne = async function (click, incs) {    
    //Adds +1 to 
    // -OffersTotal.Total
    // -OffersTotal[DAY].Total
    // Filtering by: OfferGUID
    db.connection().collection(COLLECTION_NAME).updateOne(
        {
            "OfferGUID" : click.OfferGUID,
            "OfferID" : click.OfferID,             
        },
        incs,
        {
            upsert: true
        }
    );
}


module.exports = {
    addOne:addOne
}





