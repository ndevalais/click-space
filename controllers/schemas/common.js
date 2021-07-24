const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')
/*
    Input schemas to be validated across system.
*/
module.exports.route = validator.compile({
    //Define el schema de una ruta.
    type: dataDic.http_method,
    url: dataDic.string_XL,
    controller: dataDic.function,
    schema: dataDic.schema
})
module.exports.validator = validator.compile({
    name: dataDic.string_S,
    doValidate: dataDic.function
})

