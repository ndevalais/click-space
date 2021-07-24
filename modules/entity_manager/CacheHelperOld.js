var logger = require("../log");
var NodeCache=require ("node-cache");
var moment = require('moment');
const config = require('../../modules/config');
const cache = new NodeCache( { stdTTL: config.CACHE_HELPER_STD_TTL, checkperiod: config.CACHE_HELPER_CHECK_PERIOD, deleteOnExpire: false } );
let counters = require('../../modules/counters');
const MAX_CACHE_ELEMENTS = config.MAX_CACHE_ELEMENTS;
let cacheElements = 0;
let lastAccesedKeys = {};
let currentlyProcessingKeys = {};

cache.on("expired", (key, value)=>{    
   if(value.ttk && shouldBeRefreshed(key, value.ttk) ){
       value.refreshWith().then( (refreshedValue)=>{
            logger(`Passively refreshing cache for key: ${key}.`);
           cache.set(key, {...value, element:refreshedValue}, value.ttl);
       });               
   }else{       
       cache.del(key, function(){
            delete lastAccesedKeys[key];
            counters.removeOneCacheElem();
            cacheElements--;
            logger(`Unused cache element deleted for key: ${key}.`);
       });
   }
});

const shouldBeRefreshed = (key, ttk) => {
    return moment().diff(moment(lastAccesedKeys[key]).add(ttk * 60, "seconds")) <= 0    
}

async function lockIfKeyAlreadyProcessing(key){    
    return new Promise( resolve => {
        if(!currentlyProcessingKeys[key]){
            logger(`Element with id: ${key} has not concurrent works, continue.`);
            resolve();
        }else{       
            var timerId;
            let check = ()=>{
                if(!currentlyProcessingKeys[key]){
                    logger(`Process for ${key}. ended. Unlocked.`);
                    clearInterval(timerId);
                    resolve();
                }else{
                    logger(`Process for ${key}. still running. Locked.`);
                }
            };     
            timerId = setInterval(check , 100);
        }        
    } );
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
     async getObject(key, ttl, refresh, ttk ) {
        let value;
        let retValue;
        if(key && ttl && refresh && ttk){
            try{
                await lockIfKeyAlreadyProcessing(key);
                value = cache.get(key);
            }catch(e){
                logger(`Saved from race condition. Element with id: ${key}. was recently deleted.`);
                value = undefined;
            };
            
            if(value){
                logger(`Returning matching element in NodeCache for key ${key}.`);
                counters.addOneCacheMatch();
                retValue = value.element;
            }else{
                logger(`Setting element in NodeCache with key ${key} for ${ttl} secs.`);
    
                //This marks a key as being processing rightnow.
                currentlyProcessingKeys[key]=true;
                let value = await refresh();
                delete currentlyProcessingKeys[key];
                let elem = {
                    ttk,
                    ttl,
                    refreshWith: refresh,
                    element: value
                }
                
                //Solo si hay menos elementos que el maximo especficado dejo pasar los items al cache.
                if(cacheElements < MAX_CACHE_ELEMENTS){
                    cache.set(key, elem , ttl);
                    counters.addOneCacheElem();
                    cacheElements++; 
                }
                
                retValue = value;
            }
            lastAccesedKeys[key] = moment();
        }else{
            console.log("Error! Caché helper fue llamado con parametros invalidos. key, ttl, refresh, ttk: ", key, ttl, refresh, ttk );
            var err = new Error();
            console.log(err.stack);
        }
        return retValue;
    }
}
