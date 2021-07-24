//TODO: Check With Nes
var apiVersionPrefix = "";
const controllers = require('../controllers');
const schema = require('../controllers/schemas/appsnames_schema');
module.exports = {
  'registerAppsNames': {
    type: "get",
    url: apiVersionPrefix + '/appsnames',
    schema: schema.createAppsNames,
    controller: controllers.appsnames.registerAppsNames
  }
}