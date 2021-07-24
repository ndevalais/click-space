const joi = require('joi');
const log = require('../log');
const redirectors = require('./redirectors');

const VALIDATION_ERROR = { code: 400 };


var getCodeErrorResponse = function (code, module, moduleError) {
    var emptyResponse = {
        code: code,
        error: {
            module: module || "unavailable",
            description: moduleError || "unavailable"
        }
    };
    return emptyResponse;
}
var getEmptyResponse = function (module, moduleError) {
    var emptyResponse = {
        code: 500,
        error: {
            module: module || "unavailable",
            description: moduleError || "unavailable"
        }
    };
    return emptyResponse;
}

/**
 * {
 *  code:200
 * }
 */

var getOkResponse = function (module, moduleError) {
    var emptyResponse = {
        code: 200
    };
    return emptyResponse;
}

var sendOkResponseJSON = function (res, ...params) {
    res.send({
        code: 200
    });
    res.flush();
}

var sendJSONResponse = function (res, body) {
    res.send({
        code: 200,
        body: body
    });
    res.flush();
}

var send400Error = function (res, ...params) {
    res.writeHead(400);
    res.end();
    res.flush();
}

var send500Error = function (res, ...params) {
    res.writeHead(500);
    res.end();
    res.flush();
}

var response401 = function (module, moduleError) {
    var emptyResponse = {
        code: 401,
        error: {
            module: module || "unavailable",
            description: moduleError || "unavailable"
        }
    };
    return emptyResponse;
}

var getOKResponseFromObject = function (object, objectName) {
    var dataObject = {};
    dataObject[objectName] = object;
    var response = { code: 200, data: dataObject };

    return response;
}


/*
    Takes an input object and takes actions acordingly.
    If the object received as a param contains a property
    Object should be like:

    {
        status:'all_validators_ok' | 'error_on_validators', 
        param: object
    }
*/


var httpProccess = function (req, res, next, params, route) {
    const isValid = route.schema(params);
    if (isValid === true) {
        route.controller(data)
            .then(result => redirectors.allValidatorsOKRedirector(res, result))
            .catch(error => {
                res.send(getEmptyResponse(
                    error.module ? error.module : "module.server",
                    error.error ? error.error : "module.server.error.unknow"
                ))
                res.flush()
            })
    } else {
        log(isValid);
        res.send(VALIDATION_ERROR);
    }
}

module.exports = {
    getEmptyResponse: getEmptyResponse,
    response401: response401,
    getOKResponseFromObject: getOKResponseFromObject,
    //parseResponse:parseResponse,
    httpProccess: httpProccess,
    getOkResponse: getOkResponse,
    sendOkResponseJSON: sendOkResponseJSON,
    send500Error: send500Error,
    sendJSONResponse: sendJSONResponse,
    send400Error: send400Error
}
