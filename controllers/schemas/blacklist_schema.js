const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')

/*
    Input schemas to be validated across system.
*/
//Register click schema.
module.exports.createBlacklist = validator.compile({
    subpubid: dataDic.string_XXL,
    statusid: dataDic.string_S,
    listtype: dataDic.string_S,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent
})