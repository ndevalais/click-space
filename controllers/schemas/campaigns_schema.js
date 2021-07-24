const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')

/*
    Input schemas to be validated across system.
*/
module.exports.getCampaigns = validator.compile({
    CountryCode: dataDic.string_S,
    Device: dataDic.string_S
})
module.exports.campaignsStatus = validator.compile({
    CampaignID: dataDic.numerical_id,
    StatusID: dataDic.string_S
})
