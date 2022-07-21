const config = require('../../config');
var _ = require('lodash');
var db = require('../../db/index');
const COLLECTION_NAME = 'CampaignClicksTotal';
var moment = require('moment');
var log = require("../../log");
let c = 0;
const COUNT_BEFORE_WRITE = config.COUNT_BEFORE_WRITE;
let counters = [];
let performance = require('perf_hooks').performance;

function initFlushBufferTimer(){
    setInterval(function(){
        //log("----------------->>>>>>>>> Writing to DB CampaignClicksTotal <<<<<<<<<-----------------");
        writeOutToDB();        
      }, config.WRITE_OUT_TIMER);
}

initFlushBufferTimer();


/*function increaseGlobalcounter() {
    c++;
    if (c >= COUNT_BEFORE_WRITE) {
        c = 0;
        writeOutToDB();
    }
}*/

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
        let CampaignHeadID = parseInt(keys[i].replace("#", ""));

        //var t0 = performance.now();
        let q =await executeIncsPerCampaignHead(CampaignHeadID, simpleDateYMD, incs);
        //var t1 = performance.now();
        //let tt= (t1 - t0) ;
        //if(tt>=300){
        //   console.log("Escribir tomó: " + (t1 - t0) + " milliseconds:");
        //    console.log(incs);
        //}
        

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

function executeIncsPerCampaignHead(CampaignHeadID, simpleDateYMD, incs) {
    if (!incs){
        return Promise.resolve();
    }
    //console.log("Escribiendo contadores para CampaignHeadID:", CampaignHeadID);
    return db.connection().collection(COLLECTION_NAME).updateMany(
        {
            //"CampaignGUID" : click.CampaignGUID,
            "CampaignHeadID": CampaignHeadID, "Date": simpleDateYMD
        },
        incs,
        {
            upsert: true,
            maxTimeMS: 50,
            multi: true
        }
    );
}


module.exports = {
    add: add
}

