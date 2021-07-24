let config =  require('../config');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: config.ELASTIC_SEARCH_URL })
let moment = require('moment');

module.exports = function(msg, module_name, type, stack_trace){
    if(config.SILENT_MODE=="true"){
        return Promise.resolve();
    }
    //Should have posibility to allow an offer debug
    //Cuould write to elastic    
    return new Promise(function(resolve, reject){
        let log={};    
        if(config.LOGMODE=='console'){            
                console.log(msg);
        }else if(config.LOGMODE=="elastic"){
            log = {
                CreationDate : moment().format(),
                message: JSON.stringify(msg) || "",
                module_name : JSON.stringify(module_name) || "",
                type : JSON.stringify(type) || "log",
                stack_trace: JSON.stringify(stack_trace) || ""
            };
            client.index({
                index: config.LOG_INDEX_NAME,
                // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
                body: log
              }).catch(function(err){
                  console.log(err);
                  console.log(log);
                  reject(err);
              }).then(function(){
                resolve()
              });
        }
    });
}