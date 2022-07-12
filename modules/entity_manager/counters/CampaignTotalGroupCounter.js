const config = require('../../config');
var _ = require('lodash');
var db = require('../../db/index');
const COLLECTION_NAME = 'CampaignTotalGroup';
var moment = require('moment');
var log = require("../../log");
let c = 0;
const COUNT_BEFORE_WRITE = config.COUNT_BEFORE_WRITE;
let counters = [];
var hash = require('object-hash');
const whereTag="whereObject";
const setTag="setObject";

function initFlushBufferTimer(){
    setInterval(function(){
        log("----------------->>>>>>>>> Writing to DB CampaignTotalGroup <<<<<<<<<-----------------");
        writeOutToDB();        
      }, config.WRITE_OUT_TIMER);
}

initFlushBufferTimer();

/*
function increaseGlobalcounter() {
    c++;
    if (c >= COUNT_BEFORE_WRITE) {
        c = 0;
        log("----------------->>>>>>>>> Writing to DB CampaignTotalGroup <<<<<<<<<-----------------");
        writeOutToDB();
    }
}*/

let add = async function (whereObject, path, addValue, set) {
    let key = hash(whereObject);

    addValue = addValue == undefined ? 1 : addValue;
    let replacedPath = path.replace(/\./g, "-");
    let value = _.get(counters[`#${key}`], `${replacedPath}.value`, 0);
    let obj = { 
                value: value + addValue, 
                path: path,                 
            };

    _.set(counters, `['#${key}'].${replacedPath}`, obj);
    _.set(counters, `['#${key}'].${whereTag}`, whereObject);
    if(set) _.set(counters, `['#${key}'].${setTag}`, set);
    //increaseGlobalcounter();
}


//Executa los incs de todo en los contadores
async function writeOutToDB() {
    let keys = Object.keys(counters);    

    for (let i = 0; i < keys.length; i++) {
        let obj = counters[keys[i]];
        //Me aseguro de borrarlo antes, para que sigan escribiendo ahí otros
        delete (counters[keys[i]]);

        let incs = getIncsForObject(obj);
        let sets = obj[setTag];
        if (sets) incs.$set = obj[setTag];
        let where = obj[whereTag];
        //let CampaignHeadID = parseInt(keys[i].replace("#", ""));
        let q =await executeIncsPerObject(where, incs);
    }
}

function getIncsForObject(obj) {
    let retIncs = [];
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        if(keys[i]!=whereTag && keys[i]!=setTag){
            let elem = obj[keys[i]];
            retIncs.push(`"${elem.path}":${elem.value}`);
        }
        
    }
    let values = retIncs.join(",");
    let ret = JSON.parse(`{"$inc":{ ${values} }}`);

    return ret;
}

function getWhereForObject(obj) {
    let retWheres = [];
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        let elem = obj[keys[i]];
        retWheres.push(`"${elem.path}":${elem.value}`);
    }
    let values = retWheres.join(",");
    let ret = JSON.parse(`{"$inc":{ ${values} }}`);

    return ret;
}

function executeIncsPerObject(where, incs) {    
    try{
        return db.connection().collection(COLLECTION_NAME).updateMany(
            where,
            incs,
            {
                upsert: true,
                maxTimeMS: 50,
                multi: true
            }
        );
    } catch (error) {
        log(`report: ${error}`);
        return false;
    }
}


module.exports = {
    add: add
}

