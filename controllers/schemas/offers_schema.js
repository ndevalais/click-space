const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')

/*
    Input schemas to be validated across system.
*/

//Register click schema.
module.exports.createOffers = validator.compile({
    offerid: dataDic.string_L,
    campaignid: dataDic.string_L,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent
})
module.exports.updateAdvertiser = validator.compile({
    advertiserid: dataDic.numerical_id,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent
})
module.exports.updateCampaignsHead = validator.compile({
    campaignheadid: dataDic.numerical_id,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent
})
module.exports.updateCampaigns = validator.compile({
    campaignid: dataDic.numerical_id,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent
})
module.exports.updateSuppliers = validator.compile({
    supplierid: dataDic.numerical_id,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent
})
module.exports.updateWhiteList = validator.compile({
    offerid: dataDic.numerical_id,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent
})
module.exports.updateBlackList = validator.compile({
    offerid: dataDic.numerical_id,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent
})
module.exports.updateAdvertiserPrePay = validator.compile({
    advertiserid: dataDic.numerical_id,
    prepay: dataDic.numerical_id,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent
})

