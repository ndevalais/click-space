//TODO: Check With Nes
var apiVersionPrefix= "";
const controllers = require('../controllers');
const schema = require ('../controllers/schemas/server_status_schema');
module.exports= {
    'getStatusPage':{
        type: "get",
        url: apiVersionPrefix + '/server_status',
        schema: schema.statusPageSchema,
        controller: controllers.status.getStatusInfo
    }
}
