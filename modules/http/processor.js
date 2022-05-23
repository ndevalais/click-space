const joi = require('joi');
const _ = require('lodash');
const helpers = require('../http/helpers');
const tools = require('../tools');
const config = require('../../modules/config');
const log = require('../log');
const redirectors = require('./redirectors');
const callbacks = require('./callbacks');
const fraude = require('./fraude');
const excel = require('./excel');
const PostBackURL = require('../entity_manager/postback_entity');
let counters = require('../counters');
let CountryLanguage = require('country-language');

var proccesController = function (req, res, next, session, route, resolve, reject) {
    if (route.httpCacheEnabled) {
        //TODO: When cache is enabled
    } else {
        //We forward to the configured controller
        route.controller(params).then(result => {
            resolve(result);
        }).catch(function (e) {
            reject(e);
        });
    }
}
var getParamsFromRequest = function (req) {
    //Unifies all params from query, parameters and body into one single object.
    var params = {};
    params = _.merge(req.query, req.params);
    if (req.body) {
        params = _.merge(req.body, params);
    }

    //To lowercase all incoming parameters
    params = toLowerCaseAllPropNames(params);
    params = ensureNoArrays(params);
    //Adds aditional info into params, IP, User-Agent
    //params.SourceIP = _.get(req, 'ip');

    let ip = _.get(req, config.HEADER_TO_GET_IP_FROM) || _.get(req, 'headers.x-forwarded-for') || _.get(req, 'ip') || _.get(req, 'headers.sourceip') ;
    params.SourceIP = ip.split(",")[0];
    log(`************IP FOR REQUEST: ${ip} *************`);

    if (params.SourceIP.split(":")[0]=="") params.SourceIP = _.get(req, 'headers.sourceip') ;
    params.UserAgent = _.get(req, 'headers.user-agent');    

    params.path = _.get(req, 'path');
    params.Language = _.get(req, 'headers.accept-language', '').toUpperCase();
    params.http_token_auth = _.get(req, 'headers.http-token-auth');

    return params;
}

function ensureNoArrays(obj){
    var key, keys = Object.keys(obj);
    var n = keys.length;
    
    while (n--) {
        key = keys[n];
        if( typeof(obj[key])=="object") {
            obj[key]=obj[key][0];            
        }        
    }
    return obj;
}

function toLowerCaseAllPropNames(obj) {
    var key, keys = Object.keys(obj);
    var n = keys.length;
    var newobj = {}
    while (n--) {
        key = keys[n];
        newobj[key.toLowerCase()] = obj[key];
    }
    return newobj;
}

var getSessionFromRequest = function (req) {
    session = {};
    //TODO: Get session
    return session;
}
//Sets the request with IP / UserAgent / And other info
async function fillWithAditionalData(params) {
    return new Promise(function (resolve, reject) {
        Promise.all([
            tools.ip2location.getCarrier(params.SourceIP),
            tools.ip2location.getProxy(params.SourceIP),
            tools.userAgent.getUserAgent(params.UserAgent)
        ])
            .then(function (result) {
                resolve({ AdditionalIPInfo: result[0], AdditionalProxyInfo: result[1], AdditionalUserAgentInfo: result[2] });
            }).catch(function (error) {
                reject(error);
            });
    });
}

/**
 * Evaluates if request chain needs to be redirected.
 * 
 */
function needRedirect(controllerResult) {
    return _.get(controllerResult, "redirect");
}

function needNoRedirect(controllerResult) {
    return _.get(controllerResult, "noredirect");
}

/**
 * Evaluates if request chain needs to be callback url Suppplier.
 * 
 */
function needPostack(controllerResult) {
    return _.get(controllerResult, "callback", false);
}


/**
 * Evaluates if request chain needs to be callback url Suppplier.
 * 
 */
function needWriteXLS(controllerResult) {
    return _.get(controllerResult, "xls_output", false);
}

/**
 * Evaluates if request chain needs to write output
 * 
 */
function needWriteJSON(controllerResult) {
    return _.get(controllerResult, "write_output");
}

let onControllerFinalized = async function (res, err, controllerResult) {
    if (!err) {
        let evento = _.get( controllerResult, "param.evento", "click");
        let isFraude = _.get( controllerResult, "context.offer.Campaign.isFraude", 0);
        
        //Call the redirect logic 
        if (needRedirect(controllerResult)) {
            const debug = _.get(controllerResult,'param.debug',false);
            if (debug) {
                controllerResult.url_redirect = await redirectors.parseURLFromContext(controllerResult);
                helpers.sendJSONResponse(res, controllerResult);
            } else {
                redirectors.allValidatorsOKRedirector(res, controllerResult);
            }
        } else if(needNoRedirect(controllerResult)){
            const debug = _.get(controllerResult,'param.debug',false);
            if (debug) helpers.sendJSONResponse(res, controllerResult);
            else helpers.send500Error(res);
        } else if(needPostack(controllerResult)){
            // Valido si la URL viene vacia
            let url = _.get(controllerResult,'param.PostBackURL','');
            if (url!='') {
                log(`Redirect --> ${url}`);
                callbacks.allValidatorsOKCallBack(res, controllerResult);
                url = await callbacks.parseURLFromContext(controllerResult);
            }
            const post = {};
            post.SupplierID = _.get(controllerResult,'context.offer.Supplier.SupplierID','');
            post.OfferID = _.get(controllerResult,'context.offer.OfferID','');
            post.OfferGUID = _.get(controllerResult,'context.offer.OfferGUID','');
            post.ClickID = _.get(controllerResult,'context.click.ClickID','');
            post.SubPubID = _.get(controllerResult,'context.click.SubPubID','');
            post.SubPubHash = _.get(controllerResult,'context.click.SubPubHash','');
            post.CampaignClickGUID = _.get(controllerResult,'context.click.CampaignClickGUID','');
            post.PostBackURL = url;
            post.CreationDate = new Date();
            PostBackURL.insertPostBackURL(post);

            helpers.sendOkResponseJSON(res);
        //} else if(needPostack(controllerResult)){
        //    callbacks.allValidatorsOKCallBack(res, controllerResult);
        //    helpers.sendOkResponseJSON(res);
        } else if (needWriteJSON(controllerResult)) {
            helpers.sendJSONResponse(res, controllerResult);
        } else if (needWriteXLS(controllerResult)) {
            excel.reportExcel(res, controllerResult);
        } else {
            //En este caso escribo solo ok
            console.log("WARNING:", controllerResult)
            helpers.sendOkResponseJSON(res);
        }
        
        // Si es install y tiene la marca de fraude envio a fraudscore
        if (evento == 'install' && isFraude === 1) {
            fraude.sendCallBackFraude(res, controllerResult);
        }

    } else {
        log("Silently ignoring request ... ");
        //helpers.send500Error(res);
        helpers.sendOkResponseJSON(res);
    }
}
/**
 * Identifyes if input should be sent to rotator after not passing
 * All the validators calls.
 */
let needsToBeSentToRotator = (data) => {
    //TODO: needsToBeSentToRotator 
    return false;
}
let httpProccessServiceApi = async function (req, res, next, route) {
    //injects all the objects inyto params
    var params = getParamsFromRequest(req);
    var session = getSessionFromRequest(req);
    counters.addOneCrudRequest();
    //Modo desarrollo fuerza una ip de China para pruebas
    if (config.IS_DEVELOPER_ENV === true) {
        log("Forzando IP fake...");
        params.SourceIP = "18.231.122.0"; //125.26.7.183
    }

    fillWithAditionalData(params).then(async function (result) {
        params = _.merge(params, result);

        // Obtengo lenguaje del Pais
        if (params.Language == '') {
            const code = _.get(params, "AdditionalIPInfo.CountryCode", "");
            let Lang = CountryLanguage.getCountryLanguages(code);
            params.Language = _.get(Lang[0], "iso639_1", "EN").toUpperCase();
        }
        const isValid = route.schema(params);
        if (isValid) {
            return route.controller(params)
                .then(result => 
                    onControllerFinalized(res, undefined, result)
                )
                .catch(error => 
                    onControllerFinalized(res, error, undefined)
                )
        } else {
            //Send to rotator                    
            if (needsToBeSentToRotator(params)) {
                //TODO: Send to rotator
            } else {
                helpers.send400Error(res);
            }
        }
    });
}

module.exports = {
    httpProccessServiceApi: httpProccessServiceApi
}
