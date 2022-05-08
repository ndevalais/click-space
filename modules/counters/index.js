let config = require('../config');
let memored = require('memored');
var _ = require('lodash');
let clickCountPer=[];
let crudReqCountPer=[];

let WORKER_ID =  config.WORKER_ID || -1;
let KEY_PREFIX = "stats_worker_";
let KEY = `${KEY_PREFIX}${WORKER_ID}` ;
let globalCounters = {
    clickCountSinceUP:0,
    installCountSinceUP:0,
    rotadorCountSinceUP:0,
    avgClickPerSec:0,
    avgCrudRequestsPerSec:0,
    clickCountSinceLastClean:0,
    crudeReqCountSinceLastClean:0,
    cacheElements:0,    
    cacheMatchCount:0
};
let blocked = 0;
//Calculo el AVG x Seg sample size 5

StartCalculatingAVGCrudReqPerSec(1, 5);
StartCalculatingAVGClickPerSecs(1, 5);
//Guardo cada x tiempo en la memopria compartida
StartSavingValues(4);

function StartSavingValues(secs){
    setInterval(async function(){                
        let newData =  globalCounters;
        newData.workerId = WORKER_ID;                
        await memored.store(KEY, newData);
    }, secs * 1000);
}


function StartCalculatingAVGCrudReqPerSec(secs, sampleSize){
    setInterval(function(){                
        crudReqCountPer.push(globalCounters.crudeReqCountSinceLastClean);
        globalCounters.crudeReqCountSinceLastClean=0;
        globalCounters.avgCrudRequestsPerSec =_.meanBy(crudReqCountPer);
        if(crudReqCountPer.length>=sampleSize){
            crudReqCountPer=[];
            
        }
    }, secs*1000);
}

function StartCalculatingAVGClickPerSecs(secs, sampleSize){
    setInterval(function(){
        clickCountPer.push(globalCounters.clickCountSinceLastClean);
        globalCounters.clickCountSinceLastClean=0;
        globalCounters.avgClickPerSec =_.meanBy(clickCountPer);
        if(clickCountPer.length>=sampleSize){            
            //console.log("worker:", config.WORKER_ID, ":", clickCountPer);
            clickCountPer=[];            
        }
    }, secs*1000);
}

let addOneClick=function(){
    globalCounters.clickCountSinceUP++;
    globalCounters.clickCountSinceLastClean++;
}

let addOneRotador=function(){
    globalCounters.rotadorCountSinceUP++;
}

let addOneInstall=function(){
    globalCounters.installCountSinceUP++;
}

let addOneCacheElem=function(){
    globalCounters.cacheElements++;
}
let removeOneCacheElem=function(){
    globalCounters.cacheElements--;
}
let addOneCacheMatch=function(){
    globalCounters.cacheMatchCount++;
}

let addOneCrudRequest=function(){
    //globalCounters.avgCrudRequestsPerSec++;
    globalCounters.crudeReqCountSinceLastClean++;
}

function readFromSharedMemory(key){
    if (!key){
        return Promise.reject();
    }

    return new Promise(function(resolve, reject){
        memored.read(key, function(err, result){
            resolve(result);
        });
    });
}
async function getGlobalCounters(){
    return new Promise(async function(resolve, reject){
        let res = [];
        if(config.RUN_SINGLE_INSTANCE === "false" && config.SERVER_THREAD_NUMS > 0){
            for(let i = 1; i < config.SERVER_THREAD_NUMS;i++){
                let elem;
                try{
                    let key=`${KEY_PREFIX}${i}`;
                    elem = await readFromSharedMemory(key);
                    //console.log("key:",key," elem:", elem);
                }catch(e){  
                    console.log("error:", e);              
                    elem = {};
                }
                res.push(elem);
            }  
        }
        resolve(res);
    });
}

module.exports={
    addOneInstall:addOneInstall,
    addOneClick:addOneClick,
    addOneRotador:addOneRotador,
    getGlobalCounters:getGlobalCounters,
    addOneCacheElem:addOneCacheElem,
    removeOneCacheElem:removeOneCacheElem,
    addOneCacheMatch:addOneCacheMatch,
    addOneCrudRequest:addOneCrudRequest
}