const validator = new (require("fastest-validator"))();
const dataDic = require('../../modules/data_dicts')
/** 
 * AdvertiserID 
 * OfferID
 * CampaignID
 * SupplierID
 * DateFrom
 * DateTo
 * StatusID 
 */
/*
    Input schemas to be validated across system.
*/
module.exports.registerClick = validator.compile({    
        advertiserid: dataDic.numerical_id,
        offerid: dataDic.numerical_id,
        campaignid: dataDic.numerical_id,
        supplierid: dataDic.numerical_id,
        datefrom: dataDic.string_S,
        dateto: dataDic.string_S,
        statusid: dataDic.string_S
    })

