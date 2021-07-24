//TODO: Check With Nes
var apiVersionPrefix = "";
const controllers = require('../controllers');
const schema = require('../controllers/schemas/processes_schema');
module.exports = {
  'processesDashBoard': {
    type: "get",
    url: apiVersionPrefix + '/processes/dashboard',
    schema: schema.processDashBoard,
    controller: controllers.processes.processesDashBoard
  },
  'processesCampaignTotals': {
    type: "get",
    url: apiVersionPrefix + '/processes/campaign_totals',
    schema: schema.processDashBoard,
    controller: controllers.processes.processesCampaignTotals
  }
}