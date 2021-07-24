//TODO: Check With Nes
var apiVersionPrefix = "";
const controllers = require('../controllers');
const schema = require('../controllers/schemas/campaign_status_schema');
module.exports = {
    'getStatusPage': {
        type: "get",
        url: apiVersionPrefix + '/server_campaign',
        schema: schema.statusPageSchema,
        controller: controllers.campaigns.getCampaignInfo
    }
}
