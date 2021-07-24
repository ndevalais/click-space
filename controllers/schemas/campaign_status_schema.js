const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')

/*
    Input schemas to be validated across system.
*/
module.exports.statusPageSchema = validator.compile({
    campaignid: dataDic.numerical_id,
    apikey: { type: "string" },
})