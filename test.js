var db = require('./modules/db');
async function getOffer(uuid){
    await db.connect();
    var i = require("./modules/entity_manager/index");
    
    i.getOfferByUUID(uuid);
        
}
    
getOffer("3D7DEE00-463C-E911-85B3-2818780EF331");

