//var logger = require("../log");
//var logger = console.log;
const CERO_MARKER = "<*N:cero*>";
const UNDEF_MARKER = "<*T:unde*>";
let logger = function () { }
//Used for storing functions
var NodeCache = require("node-cache");
var moment = require('moment');
const config = require('../config');
let CACHE_HELPER_STD_TTL = 100
let CACHE_HELPER_CHECK_PERIOD = 5
const cache = new NodeCache({ stdTTL: CACHE_HELPER_STD_TTL, checkperiod: CACHE_HELPER_CHECK_PERIOD, deleteOnExpire: false });
let counters = require('../counters');
const MAX_CACHE_ELEMENTS = config.MAX_CACHE_ELEMENTS;
let cacheElements = 0;
let lastAccesedKeys = {};
let currentlyProcessingKeys = {};
const redis = require('redis');
const log = require('../log');

// create and connect redis client to local instance.
const client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST);
log('CREO EL CACHE HELPER - Port: ' + config.REDIS_PORT + ' Host: ' +  config.REDIS_HOST);

cache.on("expired", async (key, value) => {
    console.log("Expired");
    /*if(value.ttk && shouldBeRefreshed(key, value.ttk) ){
        let refreshedValue = await value.refreshWith();
        logger(`Passively refreshing cache for key: ${key}.`);
        
        let promises = [
            cache.set(key, {...value} , value.ttl),
            writeToPersistentStore(key, refreshedValue, value.ttl)
        ];

        Promise.all(promises);
    }else{    */
    //Delete element form redis too?
    cache.del(key, function () {
        delete lastAccesedKeys[key];
        counters.removeOneCacheElem();
        cacheElements--;
        logger(`Unused cache element deleted for key: ${key}.`);
    });
    //}
});

const shouldBeRefreshed = (key, ttk) => {
    return moment().diff(moment(lastAccesedKeys[key]).add(ttk * 60, "seconds")) <= 0
}

async function lockIfKeyAlreadyProcessing(key) {
    return new Promise(resolve => {
        if (!currentlyProcessingKeys[key]) {
            logger(`Element with id: ${key} has not concurrent works, continue.`);
            resolve();
        } else {
            var timerId;
            let check = () => {
                if (!currentlyProcessingKeys[key]) {
                    logger(`Process for ${key}. ended. Unlocked.`);
                    clearInterval(timerId);
                    resolve();
                } else {
                    logger(`Process for ${key}. still running. Locked.`);
                }
            };
            timerId = setInterval(check, 100);
        }
    });
}


async function readFromPersistentStore(key) {
    return new Promise(function (resolve, reject) {
        client.get(key, function (err, result) {
            if (!err) {
                try {
                    let res = JSON.parse(result);
                    if (res == CERO_MARKER) {
                        res = 0;
                    } else if (res == UNDEF_MARKER) {
                        res = undefined;
                    }
                    resolve(res);
                } catch (e) {
                    console.log("error parseando:", result);
                    reject("error de parseo.");
                }

            } else {
                reject();
            }
        });
    });
}

async function writeToPersistentStore(key, object, ttl) {
    return new Promise(function (resolve, reject) {
        let parsedObject = object === 0 ? JSON.stringify(CERO_MARKER) : JSON.stringify(object);
        if (parsedObject == undefined) {
            parsedObject = JSON.stringify(UNDEF_MARKER);
        }
        client.setex(key, ttl, parsedObject, function (err, result) {
            if (!err) {
                resolve(result);
            } else {
                reject();
            }
        });


    });
}

module.exports = class CacheHelper {
    /**
     * Helper for cached objects
     * 
     * @key The key under wich the object will be saved
     * @ttl Seconds until removal from cache
     * @refresh Function, Funcation that will feed the object to be cached
     * @ttk Number, minutes. If provided, cacheHelper will keep refreshing this object every @ttl ms until
     * no one queries an object with @key inside de @ttk window.
     */
    async getObject(key, ttl, refresh, ttk) {
        let value;
        let retValue;
        if (key && ttl && refresh) {
            try {
                await lockIfKeyAlreadyProcessing(key);
                //Acá obtendo el dato crudo desde el cache.
                //value = cache.get(key);

                value = await readFromPersistentStore(key);
            } catch (e) {
                logger(`Saved from race condition. Element with id: ${key}. was recently deleted.`);
                value = undefined;
            };

            if (value) {
                logger(`Returning matching element in NodeCache for key ${key}.`);
                counters.addOneCacheMatch();
                //log('CACHE retono valor = ' + value);
                retValue = value;
            } else {
                try {
                    //logger(`Setting element in NodeCache with key ${key} for ${ttl} secs.`);

                    //This marks a key as being processing rightnow.
                    currentlyProcessingKeys[key] = true;
                    value = await refresh();

                    //let elem = {
                    //    ttk,
                    //    ttl,
                    //    refreshWith: refresh
                    //    //element: value
                    //}

                    //Solo si hay menos elementos que el maximo especficado dejo pasar los items al cache.
                    //if(cacheElements < MAX_CACHE_ELEMENTS){
                    //let promises = [
                    //    //cache.set(key, elem , ttl),
                    //    writeToPersistentStore(key, value, ttl)
                    //];
                    writeToPersistentStore(key, value, ttl);
                    //log('CACHE - creo con key: ' + key + ' - ttl: ' + ttl + ' - value: ' + value);
                    //counters.addOneCacheElem();
                    //cacheElements++;
                    //}
                } catch (e) {
                    console.log("ERROR:", e);
                }
                delete currentlyProcessingKeys[key];
                retValue = value;

            }
            lastAccesedKeys[key] = moment();
        } else {
            console.log("Error! Caché helper fue llamado con parametros invalidos. key, ttl, refresh, ttk: ", key, ttl, refresh, ttk);
            var err = new Error();
            console.log(err.stack);
        }
        return retValue;
    }
}
