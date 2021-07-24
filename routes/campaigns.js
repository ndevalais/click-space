//TODO: Check With Nes
var apiVersionPrefix = "";
const controllers = require('../controllers');
const schema = require('../controllers/schemas/campaigns_schema');
module.exports = {
  'getCampaigns': {
    type: "get",
    url: apiVersionPrefix + '/campaigns',
    schema: schema.getCampaigns,
    controller: controllers.campaigns.getCampaigns
  },
  'campaignsStatus': {
    type: "post",
    url: apiVersionPrefix + '/campaignsStatus',
    schema: schema.campaignsStatus,
    controller: controllers.campaigns.campaignsStatus
  }
}



