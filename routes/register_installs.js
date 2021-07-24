//TODO: Check With Nes
var apiVersionPrefix = "";
const controllers = require("../controllers");
const schema = require("../controllers/schemas/register_installs_schema");

module.exports = {
  registerInstalls: {
    type: "get",
    url: apiVersionPrefix + "/tracking",
    schema: schema.registerInstall,
    controller: controllers.events.processEvents
  },
  registerSandboxInstalls: {
    type: "get",
    url: apiVersionPrefix + "/sandbox/tracking",
    schema: schema.registerInstall,
    controller: controllers.events.processEvents
  }
};
