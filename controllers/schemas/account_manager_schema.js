const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')

/*
    Input schemas to be validated across system.
*/
module.exports.registerAccountManager = validator.compile({
    UserTypeID: dataDic.string_S,
    UserID: dataDic.numerical_id
})