const c = require('../constants');
const config = require('../config');
/**
* This files defines all the data types to be verified by JOI.
* Every input field, or field to be validated should exist here.
**/

// const Joi = require('joi');

// module.exports = {
//     http_method: Joi.string().valid(['get', 'post', 'delete']),
//     function: Joi.func(),
//     schema: Joi.object(),
//     email: Joi.string().email({ minDomainAtoms: 2 }).max(c.LENGTHS.STRING_M),

//     string_S: Joi.string().max(c.LENGTHS.STRING_S),
//     string_M: Joi.string().max(c.LENGTHS.STRING_M),
//     string_L: Joi.string().max(c.LENGTHS.STRING_L),
//     string_XL: Joi.string().max(c.LENGTHS.STRING_XL),
//     string_XXL: Joi.string().max(c.LENGTHS.STRING_XXL),
//     uuid: Joi.string(),//.regex(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/),

//     numerical_id: Joi.number(),

//     available: Joi.boolean(),

//     offerguid: Joi.string().max(c.LENGTHS.STRING_XL),
//     campaignclickid: Joi.string().max(c.LENGTHS.STRING_XL),
//     //campaignclickguid: Joi.string().length(24).hex(), //TODO: Tomar este que es el que debereia ir a prd
//     campaignclickguid: Joi.string().max(c.LENGTHS.STRING_S),
//     subpubid: Joi.string().max(c.LENGTHS.STRING_XL),

//     sourceIP: Joi.string().max(c.LENGTHS.STRING_S),
//     //TODO: Check that 
//     userAgent: Joi.string().max(c.LENGTHS.STRING_XL),
//     enableDebug: Joi.boolean(),
//     object: Joi.object(),
//     apiKey: Joi.string().valid([config.API_KEY_SECRET])
// }
module.exports = {
    http_method: { type: "enum", values: ['get', 'post', 'delete'] },
    function: { type: "function" },
    schema: { type: "object" },
    email: { type: "email" },
    string_S: { type: "string", max: c.LENGTHS.STRING_S },
    string_M: { type: "string", max: c.LENGTHS.STRING_M },
    string_L: { type: "string", max: c.LENGTHS.STRING_L },
    string_XL: { type: "string", max: c.LENGTHS.STRING_XL },
    string_XXL: { type: "string", max: c.LENGTHS.STRING_XXL },
    uuid: { type: "string", max: c.LENGTHS.STRING_L },
    numerical_id: { type: "number" },
    available: { type: "boolean" },
    offerguid: { type: "string", max: c.LENGTHS.STRING_XL },
    campaignclickid: { type: "string", max: c.LENGTHS.STRING_XL },
    //campaignclickguid: Joi.string().length(24).hex(), //TODO: Tomar este que es el que debereia ir a prd
    campaignclickguid: { type: "string", max: c.LENGTHS.STRING_S },
    subpubid: { type: "string", max: c.LENGTHS.STRING_XL },

    sourceIP: { type: "string", max: c.LENGTHS.STRING_S },
    //TODO: Check that 
    userAgent: { type: "string", max: c.LENGTHS.STRING_XL },
    enableDebug: { type: "boolean" },
    object: { type: "object" },
    apiKey: { type: "enum", values: [config.API_KEY_SECRET] }
}