
var log = require("../modules/log")
const c = require('../modules/constants');
const counters = require('../modules/counters');
var getStatusInfo = async function(params){
    return new Promise (async (resolve,reject)=>{
        let c = {};
        c.instanceStatistics = await counters.getGlobalCounters();

        let summarizedOutput = [{}];
        let input = c.instanceStatistics;
        for( i in input){    
          for (key in input[i]){
                if(summarizedOutput[0].hasOwnProperty(key)){
                    summarizedOutput[0][key]+=input[i][key];
                }else{
                    summarizedOutput[0][key]=input[i][key];
                }
            }
        }

        c.memoryUsage = process.memoryUsage();
        c.pid = process.pid;
        c.memoryUsage.rss = (c.memoryUsage.rss / 1024) / 1024;
        c.memoryUsage.heapTotal = (c.memoryUsage.heapTotal/ 1024) / 1024;
        c.memoryUsage.heapUsed = (c.memoryUsage.heapUsed / 1024) / 1024 ;
        c.memoryUsage.external = (c.memoryUsage.external/ 1024) / 1024 ;

        resolve({
                summarizedOutput:summarizedOutput,
                globalCounters:c,
                write_output:true,
                process_from: 'getStatusInfo', 
                status: 'all_validators_ok', 
                param: params
                
        });
    });
}

/*setInterval(async function(){
    console.log(await getStatusInfo());
}, 3000);*/

module.exports={
    getStatusInfo:getStatusInfo
}