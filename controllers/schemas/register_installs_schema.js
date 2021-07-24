const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')

/*
    Input schemas to be validated across system.
*/
module.exports.registerInstall = validator.compile({
    enableDebug: { ...dataDic.enableDebug, optional: true },
    SourceIP: dataDic.sourceIP,
    UserAgent: dataDic.userAgent,
    AdditionalIPInfo: { ...dataDic.object, optional: true },
    AdditionalProxyInfo: { ...dataDic.object, optional: true },
    AdditionalUserAgentInfo: { ...dataDic.object, optional: true },
    campaignclickguid: dataDic.campaignclickguid
})