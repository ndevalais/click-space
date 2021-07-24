//TODO: Check With Nes
var apiVersionPrefix= "";
const controllers = require('../controllers');
const schema = require ('../controllers/schemas/register_click_schema');
module.exports= {
    'registerClick':{
        type: "get",
        url: apiVersionPrefix + '/click',
        schema: schema.registerClick,
        controller: controllers.click.registerClick        
    },
    'registerSandboxClick':{
        type: "get",
        url: apiVersionPrefix + '/sandbox/click',
        schema: schema.registerClick,
        controller: controllers.click.registerClick        
    }
}
