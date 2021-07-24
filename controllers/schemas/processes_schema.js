const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')

/*
    Input schemas to be validated across system.
*/

module.exports.processDashBoard = validator.compile({
        apikey: dataDic.apiKey
})

