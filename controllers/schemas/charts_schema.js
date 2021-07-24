const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')

/*
    Input schemas to be validated across system.
*/
module.exports.consultCharts = validator.compile({
  datefrom: dataDic.string_S,
  dateto: dataDic.string_S,
})