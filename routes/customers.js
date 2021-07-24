//TODO: Check With Nes
var apiVersionPrefix= "";
const controllers = require('../controllers');
const schema = require ('../controllers/schemas/customers_schema');
module.exports= {
    'registerCustomer':{
        type: "get",
        url: apiVersionPrefix + '/customers',
        schema: schema.registerCustomer,
        controller: controllers.customers.registerCustomer
    },
}
