var moment = require('moment');
const config = require('../../modules/config');
var _ = require('lodash');
var db = require('../db/index');
var mongo = new require('mongodb');
let c = require("../constants");
const crypto = require('crypto');
let CacheHelper = require("./CacheHelper");
let ch = new CacheHelper();
var hash = require('object-hash');
var request = require('request');
var log = require("../log");

// Expire the signature horas
const EXPIRATION_TTL = 24;
// "Minutos que deben pasar sin consultarse un objeto en la caché antes de olvidarse de el",
const CACHE_TTK_ELEMENT_NO_ACTIVITY = 60; // * EXPIRATION_TTL; // 4 horas
// "Tiempo de refresco de caché para cada elemento, en segundos.",
const CACHE_TTL = 3600; //3600 * EXPIRATION_TTL;
const MINUTES_TTL = 10;

// Clave de la firma Appsflyer
const key ='Bearer eyJhbGciOiJBMjU2S1ciLCJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwidHlwIjoiSldUIiwiemlwIjoiREVGIn0.7EgPLtG6tIyZgTQNJ7lV5rAYmopcAZC5tfSGN1Orpz9hd9P-uRTjVw.dMFqbYw1JwbS6oFy.No4E069tos1BN4A09VuEAhFq85rmp4C1TxpIzA9dXF5Ah0uEFoW134oilafS-j1Vw8zSvIhAG5MSZFEW7ItNTvgdUIYhfRWC93My2GeddclzgLXNUd1o2uJJ0ORR9fbRknFqrjSIOLVWIhvZ_P0M2Q6_u8-ysD8q-G4moNpre63ru7IO1QBL3cAVj7yEzNYVwhCO6hQgGmdVa5K6I68F-zoIhIM-jahQQhdCmdnwP8foa8IpNDYq8hVUQh6fkyB2BWuksfhLjTE3hcvk7f0CeyFFvoDbi9IYHc3jqlSuHbypcnKW-Z_r3k_pl5WVqNOe2WRN6ZouhtkVHqBDVkFgt3_a4NjrbeDS-UxD8Udl4AfgO_oN3TL83pHMDvO4me_I158FqZSEmenMPAd7H0dHqbQXzFXq4VBTxi_yejmSWECOv2DUju_DvFabc8ZO1Vn7wtXJKCM4sKCHUDjEZ5-JANXO-OHvs5dKbT9DHk1XtS86P7Ca6aLMuQmJdGy9a61rpIQG7V4rwNNJST9_glM5.osY488-NLBj450rynZnkjQ';
const header =  {
    'Content-Type': 'application/json',
    'Authorization': key
};
const optionsCreate = {
    'method': 'POST',
    'url': 'https://hq1.appsflyer.com/api/p360-click-signing/secret?ttlHours=24',
    'headers': header
};

const COLLECTION_NAME="Signatures";

const structure = {
    "SecretKeyID" : undefined,
    "SecretKey" : undefined,
    "Expiration" : undefined,
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

var getSignature = async function (clickUrl){
    try {
        const uuid = hash( {signature: 'signature_new'} );
        let secretKey;
        let expiration = Date.now() + (60000 * MINUTES_TTL);
        clickUrl += "&expires=" + expiration;
        
        var f = async function () {
            const elem1 = await db.connection().collection(COLLECTION_NAME).find({}).sort({_id: -1}).limit(1).toArray();
            // Si no existe elementos debemos crear uno
            if (!elem1[0]) {
                const af = await signatureAppsflyer();
                const elem2 = await saveSignature(af);
                secretKey = elem2.SecretKey.toString();
                log('Creo nueva clave secreta Appsflyer --> ' + secretKey);
            } else {
                // Busco y valido la firma , si no existe la creo
                secretKey = await updateAppsflyer( elem1[0].SecretKey.toString(), elem1[0].SecretKeyID.toString() );
                log('Valido  nueva clave secreta Appsflyer --> ' + secretKey);
            }
            return secretKey;
        }
        secretKey = await ch.getObject(uuid, CACHE_TTL, f, CACHE_TTK_ELEMENT_NO_ACTIVITY);
        log('secretKey: ' + secretKey);
        let secretKeyObj = crypto.createHmac('sha256', secretKey);
        let signingKey = secretKeyObj.update(clickUrl).digest('base64');
        signingKey = signingKey.replace(/\+/g,'-').replace(/\//g,'_');
        clickUrl += "&signature=" + signingKey.substring(0, signingKey.length -1);
        return clickUrl;
    } catch (error) {
        log(`Error getSignature ${error} `);
        return "";
    }
}

var saveSignature = async function (signature) {
    try {
        if(signature){
            let signatureStructure = _.clone(structure);  
            signatureStructure.SecretKeyID = _.get(signature, 'secret-key-id');
            signatureStructure.SecretKey = _.get(signature, 'secret-key');
            signatureStructure.Expiration = _.get(signature, 'expiration',0);
            signatureStructure.CreationDate = new Date();
            signatureStructure.ExpireAt = getExpirationDate();
            //x = new Date((_.get(signature, 'expiration')*1000)+ (1*3600*1000)) //.getTime()
            const data = await db.connection().collection(COLLECTION_NAME).insertOne(signatureStructure); 
            return data.ops[0]; // x.insertedCount == 1 si lo inserto
        } else {
            throw Error('signatureCanNotBeUndefined');
        }
    } catch (error) {
        log(`Error saveSignature ${error} `);
        return false;
    }
}

var updateAppsflyer = async function (secretKey, SecretKeyID) {
    try{ 
        let temp;
        var optionsConfig = {
            'method': 'GET',
            'url': 'https://hq1.appsflyer.com/api/p360-click-signing/config',
            'headers': header
        };

        // Obtengo las firmas creadas
        temp = await requestApps(optionsConfig);
        temp = JSON.parse(temp);

        // Valido si existen firmas configuradas
        let exist = false;
        for( let i = 0; i < temp["active-key-ids"].length; i++) {
            if (temp["active-key-ids"][i]["secret-key-id"]== SecretKeyID) exist = true;
        }
        if (exist) return secretKey;
        else await revocaAppsflyer(temp);

        temp = await requestApps(optionsCreate);
        temp = JSON.parse(temp);
        await saveSignature(temp);
        await enableAppsflyer(); 
        return _.get(temp, 'secret-key');

    } catch (error) {
        log(`Error validateAppsflyer ${error} `);
        return false;
    }
}

var signatureAppsflyer = async function () {
    try{ 
        let temp;
        let temp1;

        var optionsConfig = {
            'method': 'GET',
            'url': 'https://hq1.appsflyer.com/api/p360-click-signing/config',
            'headers': header
        };

        temp = await requestApps(optionsCreate);
        // Si no puedo crear nueva firma borro todas las firmas creadas
        if (temp=='Too many active keys') {
          // Elimino las firmas
          temp1 = await requestApps(optionsConfig);
          temp1 = JSON.parse(temp1);
          await revocaAppsflyer(temp1);
          // Creo nueva firma
          temp = await requestApps(optionsCreate);
          temp = JSON.parse(temp);
          
          // Valido si la firma esta activa
          if (temp1["mode"]!='enable') await enableAppsflyer(); 
        } else {
            temp = JSON.parse(temp);
            // Valido si la firma esta activa
            temp1 = await requestApps(optionsConfig);
            temp1 = JSON.parse(temp1);
            if (temp1["mode"]!='enable') await requestApps(optionsEnable);
        }
        
        return temp;
    }  catch (error) {
        log(`Error signatureAppsflyer ${error} `);
        return false;
    }
}

var revocaAppsflyer = async function (temp1) {
    try{ 
        let revoca1 = false;
        let revoca2 = false;
        if (temp1["active-key-ids"].length>0) revoca1 = temp1["active-key-ids"][0]["secret-key-id"];
        if (temp1["active-key-ids"].length>1) revoca2 = temp1["active-key-ids"][1][ "secret-key-id"];
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
        if (revoca1) await requestApps(optionsDel1);
        if (revoca2) await requestApps(optionsDel2);

    }  catch (error) {
        log(`Error revocaAppsflyer ${error} `);
        return false;
    }
}  

var enableAppsflyer = async function () {
    try{ 
        var optionsEnable = {
            'method': 'POST',
            'url': 'https://hq1.appsflyer.com/api/p360-click-signing/config/mode/enabled',
            'headers': header
        };
        await requestApps(optionsEnable);
        return true;
    }  catch (error) {
        log(`Error enableAppsflyer ${error} `);
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
    return new Date(moment().add(EXPIRATION_TTL, 'h'));
}
