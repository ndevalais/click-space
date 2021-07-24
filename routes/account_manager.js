//TODO: Check With Nes
var apiVersionPrefix = "";
const controllers = require('../controllers');
const schema = require('../controllers/schemas/account_manager_schema');
module.exports = {
  'getAccountManager': {
    type: "get",
    url: apiVersionPrefix + '/account_manager',
    schema: schema.registerAccountManager,
    controller: controllers.account_manager.getAccountManager
  }
}