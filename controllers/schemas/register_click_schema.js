const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')

/*
    Input schemas to be validated across system.
*/
module.exports.registerClick = validator.compile({
    enableDebug: { ...dataDic.enableDebug, optional: true },
    offerguid: dataDic.offerguid,
    clickid: dataDic.offerguid,
    campaignclickguid: { ...dataDic.string_S, optional: true },
    subpubid: dataDic.offerguid,
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent,
    AdditionalIPInfo: { ...dataDic.object, optional: true },
    AdditionalProxyInfo: { ...dataDic.object, optional: true },
    AdditionalUserAgentInfo: { ...dataDic.object, optional: true }
})


