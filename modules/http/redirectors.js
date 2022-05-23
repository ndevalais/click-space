const _ = require('lodash');
const log = require('../log');
const macrosConfig = require('./macrosConfig');
const ejs = require('ejs');
const Tokenizr = require('tokenizr');
const util = require('../entity_manager/utils');
const signature = require('../entity_manager/signature_entity');
let lexer = new Tokenizr();

function initLexerRule(){
    //Any thing between {} is added as a macro, to the tokeninzr
    lexer.rule(/{[a-zA-Z_][a-zA-Z0-9_]*}/, (ctx, match) => {
        ctx.accept("macroValue");
    })
    //Anything else, is descarded as a simple char
    lexer.rule(/./, (ctx, match) => {
        ctx.accept("char");
    })
}
initLexerRule();


/*  
    Takes a context object and parses URL using the macros defined in     
    macrosConfig.js using ejs templates.
    The URL is defined in field: 'context.offer.Campaign.URL'
*/

async function parseURLFromContext(context) {
    let url = _.get(context,'context.offer.Campaign.URL');
    let macros = [];
    try{
        lexer.input(url);
        //Tokenize my URL and pushes macroValues in array
        lexer.tokens().forEach((token) => {        
            if(token.type=='macroValue'){
                let key = token.value.substring(1, token.value.length -1 ); //removes the  trailing  { }'s from macro key
                let ejsTemplate = macrosConfig[key]; // with that key, gets from macrosConfig the ejs definition
                if(ejsTemplate){
                    let result = ejs.render(ejsTemplate, context); // compiles ejs                
                    url=url.replace(token.value, result).replace(' ','_');//finally replaces the key by the value compiled on the URL
                }else{
                    log(`WARNING: No macro [${key}] defined, but requested on URL: ${url}`);
                }
            }
        })
        // AGREGO LA FIRMA DE APPFLYER
        if (url.indexOf('app.appsflyer.com')>0){
            let param = await signature.getSignature();
            url=url + param;
            log('URL APPSFLYER: ' + url);
        }
        return url;
    } catch(e) {
        log(`ERROR: parseURL() - [${e}]`);
    }
}


/*  Takes an input object (@param) and takes actions acordingly.
    If the object received as a param contains a property
    Object should be like:
    {
        status:'all_validators_ok' | 'error_on_validators', 
        param: object
    }
*/
function allValidatorsOKRedirector(response, params){    
    try{
        if(params.status == 'all_validators_ok'){        
            let parsedUrl = parseURLFromContext(params); //Parse URL with macros
            log("Redirecting to: " + parsedUrl);
            response.writeHead(
                302,
                {Location: `${parsedUrl}` }
            );
            response.end();
        }
    }catch(e){
        log(`ERROR: redirect URL - [${e}]`);
    }
}

module.exports = {
    parseURLFromContext:parseURLFromContext,
    allValidatorsOKRedirector:allValidatorsOKRedirector 
}

