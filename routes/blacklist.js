//TODO: Check With Nes
var apiVersionPrefix = "";
const controllers = require('../controllers');
const schema = require('../controllers/schemas/blacklist_schema');

module.exports = {
  'registerBlacklist': {
    type: "get",
    url: apiVersionPrefix + '/create_blacklist',
    schema: schema.createBlacklist,
    controller: controllers.blacklist.registerBlacklist
  },
  'getBlacklist': {
    type: "get",
    url: apiVersionPrefix + '/blacklist',
    schema: schema.createBlacklist,
    controller: controllers.blacklist.getBlacklist
  },
  'createUpdateBlacklist': {
    type: "post",
    url: apiVersionPrefix + '/blacklist',
    schema: schema.createBlacklist,
    controller: controllers.blacklist.createUpdateBlacklist
  },
  'deleteBlacklist': {
    type: "delete",
    url: apiVersionPrefix + '/blacklist',
    schema: schema.createBlacklist,
    controller: controllers.blacklist.deleteBlacklist
  },
  'getBLSubPub': {
    type: "get",
    url: apiVersionPrefix + '/blsubpub',
    schema: schema.createBlacklist,
    controller: controllers.blacklist.getBLSubPub
  }
}