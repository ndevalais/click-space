var moment = require('moment');
const config = require('../../modules/config');
var _ = require('lodash');
var db = require('../db/index');
var mongo = new require('mongodb');
let c = require("../constants");
const SHA256 = require("crypto-js/sha256");
let CacheHelper = require("./CacheHelper");
let ch = new CacheHelper();
var hash = require('object-hash');
var request = require('request');
var log = require("../log");

// "Minutos que deben pasar sin consultarse un objeto en la caché antes de olvidarse de el",
const CACHE_TTK_ELEMENT_NO_ACTIVITY = 240; // 4 horas
// "Tiempo de refresco de caché para cada elemento, en segundos.",
const CACHE_TTL = 14400;

// Clave de la firma Appsflyer
const key ='Bearer eyJhbGciOiJBMjU2S1ciLCJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwidHlwIjoiSldUIiwiemlwIjoiREVGIn0.7EgPLtG6tIyZgTQNJ7lV5rAYmopcAZC5tfSGN1Orpz9hd9P-uRTjVw.dMFqbYw1JwbS6oFy.No4E069tos1BN4A09VuEAhFq85rmp4C1TxpIzA9dXF5Ah0uEFoW134oilafS-j1Vw8zSvIhAG5MSZFEW7ItNTvgdUIYhfRWC93My2GeddclzgLXNUd1o2uJJ0ORR9fbRknFqrjSIOLVWIhvZ_P0M2Q6_u8-ysD8q-G4moNpre63ru7IO1QBL3cAVj7yEzNYVwhCO6hQgGmdVa5K6I68F-zoIhIM-jahQQhdCmdnwP8foa8IpNDYq8hVUQh6fkyB2BWuksfhLjTE3hcvk7f0CeyFFvoDbi9IYHc3jqlSuHbypcnKW-Z_r3k_pl5WVqNOe2WRN6ZouhtkVHqBDVkFgt3_a4NjrbeDS-UxD8Udl4AfgO_oN3TL83pHMDvO4me_I158FqZSEmenMPAd7H0dHqbQXzFXq4VBTxi_yejmSWECOv2DUju_DvFabc8ZO1Vn7wtXJKCM4sKCHUDjEZ5-JANXO-OHvs5dKbT9DHk1XtS86P7Ca6aLMuQmJdGy9a61rpIQG7V4rwNNJST9_glM5.osY488-NLBj450rynZnkjQ';

const COLLECTION_NAME="Signatures";

const structure = {
    "SecretKeyID" : undefined,
    "SecretKey" : undefined,
    "Expiration" : undefined,
    "Signature" : undefined,
    "CreationDate": undefined
}

function requestApps(options) {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) reject(error);
            //Too many active keys
            if (response.statusCode != 200 && response.statusCode != 429) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            resolve(body);
        });
    });
}

var getSignature = async function (){
    try {
        let param = "";
        const uuid = hash( {signature: 'siganature'} );
        var f = async function () {
            const elem1 = await db.connection().collection(COLLECTION_NAME).findOne({});
            // Si no existe elementos debemos crear uno
            if (!elem1) {
                const af = await signatureAppsflyer();
                const elem2 = await saveSignature(af);
                param = '&expiration=' + elem2.Expiration + '&signature=' + elem2.Signature.toString();
            } else {
                param = '&expiration=' + elem1.Expiration + '&signature=' + elem1.Signature.toString();
            }
            return param;
        }
        param = await ch.getObject(uuid, CACHE_TTL, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
        return param;

    } catch (error) {
        return "";
    }
}

var saveSignature = async function (signature) {
    try {
        if(signature){
            let signatureStructure = _.clone(structure);  
            signatureStructure.SecretKeyID = _.get(signature, 'secret-key-id');
            signatureStructure.SecretKey = _.get(signature, 'secret-key');
            signatureStructure.Expiration = _.get(signature, 'expiration',0);// * 1000;
            signatureStructure.Signature = SHA256( signature['secret-key'] ).toString();
            signatureStructure.CreationDate = new Date();
            signatureStructure.ExpireAt = getExpirationDate();
            //x = new Date((_.get(signature, 'expiration')*1000)+ (1*3600*1000)) //.getTime()
            const x = await db.connection().collection(COLLECTION_NAME).insertOne(signatureStructure);    
            return x.ops[0]; // x.insertedCount == 1 si lo inserto
        } else {
            throw Error('signatureCanNotBeUndefined');
        }
    } catch (error) {
        return false;
    }
}


var signatureAppsflyer = async function () {
    try{ 
        var header =  {
            'Content-Type': 'application/json',
            'Authorization': key
        };
        var optionsCreate = {
            'method': 'POST',
            'url': 'https://hq1.appsflyer.com/api/p360-click-signing/secret?ttlHours=4',
            'headers': header
        };
      var optionsConfig = {
        'method': 'GET',
        'url': 'https://hq1.appsflyer.com/api/p360-click-signing/config',
        'headers': header
      };
        //if (!signature["secret-key"]) {
        let temp = await requestApps(optionsCreate);
        // Si no puedo crear nueva firma borro todas las firmas creadas
        if (temp=='Too many active keys') {
          // Elimino las firmas
          let temp1 = await requestApps(optionsConfig);
          temp1 = JSON.parse(temp1);
          revoca1 = temp1["active-key-ids"][0]["secret-key-id"];
          revoca2 = temp1["active-key-ids"][1][ "secret-key-id"];
          var optionsDel1 = {
            'method': 'DELETE',
            'url': 'https://hq1.appsflyer.com/api/p360-click-signing/secret/' + revoca1,
            'headers': header
          };
          var optionsDel2 = {
            'method': 'DELETE',
            'url': 'https://hq1.appsflyer.com/api/p360-click-signing/secret/' + revoca2,
            'headers': header
          };
          await requestApps(optionsDel1);
          await requestApps(optionsDel2);
          // Creo nueva firma
          temp = await requestApps(optionsConfig);
        }
        temp = JSON.parse(temp);
        //}
        return temp;
    }  catch (error) {
        log(`Error ${error} `);
        return false;
    }
}

module.exports = {
    getSignature: getSignature,
    saveSignature: saveSignature
}

//Get the date + configured days in environment
function getExpirationDate(){    
    //return new Date(moment().add(config.MONGO_DB_signature_EXPIRATION_IN_DAYS ,'days'));
    return new Date(moment().add(1, 'h'));
}
