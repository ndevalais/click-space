const config = require('../../config');
var _ = require('lodash');
var db = require('../../db/index');
const COLLECTION_NAME = 'CampaignTotalSubPub';
var moment = require('moment');
var log = require("../../log");
let c = 0;
const COUNT_BEFORE_WRITE = config.COUNT_BEFORE_WRITE;
let counters = [];
let performance = require('perf_hooks').performance;

function initFlushBufferTimer(){
    setInterval(function(){
        log("----------------->>>>>>>>> Writing to DB CampaignTotalSubPub <<<<<<<<<-----------------");
        writeOutToDB();        
      }, config.WRITE_OUT_TIMER);
}

initFlushBufferTimer();

let add = async function (key, path, addValue) {
    addValue = addValue == undefined ? 1 : addValue;
    if(/\.{2,}/.test(path)){  //Si el path tiene ".." o más quiere decir que alguna propiedad está en blanco, y va a explotar.        
        //Mejor devuelvo acá para no hacer lio    
        console.log(`Error! Please check: ${path} would result on failure. Not registering this counter.`);
        return; 
    }

    let replacedPath = path.replace(/\./g, "-");  
    let value = _.get(counters[`#${key}`], `${replacedPath}.value`, 0);
    let obj = { value: value + addValue, path: path }

    _.set(counters, `['#${key}']${replacedPath}`, obj);
    //increaseGlobalcounter();
}

//Executa los incs de todo en los contadores
async function writeOutToDB() {
    let keys = Object.keys(counters);
    const simpleDateYMD = moment().format('YYYYMMDD');
    for (let i = 0; i < keys.length; i++) {
        let obj = counters[keys[i]];
        //Me aseguro de borrarlo antes, para que sigan escribiendo ahí otros
        delete (counters[keys[i]]);

        let incs = getIncsForObject(obj);
        let OfferGUID = keys[i].split('|')[0].replace("#", "");
        let SubPubHash = parseInt(keys[i].split('|')[1]);

        //var t0 = performance.now();
        let q =await executeIncsPerCampaignTotalSubPub(OfferGUID, SubPubHash, simpleDateYMD, incs);

    }
}

function getIncsForObject(obj) {
    if(!obj) return undefined;
    let retIncs = [];
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        let elem = obj[keys[i]];
        retIncs.push(`"${elem.path}":${elem.value}`);
    }
    let values = retIncs.join(",");
    let ret = JSON.parse(`{"$inc":{ ${values} }}`);

    return ret;
}

function executeIncsPerCampaignTotalSubPub(OfferGUID, SubPubHash, Date, incs) {
    if (!incs){
        return Promise.resolve();
    }
    let ExpireAt = getExpirationDate(2);

    incs.$set = {ExpireAt: ExpireAt};
    //console.log("Escribiendo contadores para CampaignHeadID:", CampaignHeadID);
    return db.connection().collection(COLLECTION_NAME).updateOne(
        {
            'OfferGUID': OfferGUID,
            'SubPubHash': SubPubHash,
            'Date': Date
        },
        incs,
        {
            upsert: true,
            maxTimeMS: 50
        }
    );
}

function getExpirationDate(dias){    
    return new Date(moment().add(dias ,'days'));
}


module.exports = {
    add: add
}

