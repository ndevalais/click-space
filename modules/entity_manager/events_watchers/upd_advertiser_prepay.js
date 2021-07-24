/**
 * 
 * This event watcher is fire once every click is saved, receives
 * the inserted click onfo as a param
 */

/*
- Llamar a la URL de postback, de acuerdo a un calculo (Proxy de la Oferta)
- Oferta + Evento cuantas instalaciones para esta fecha.
*/
const c = require ('../../constants');

let O = require('../offer_entity');
let A = require('../advertiser_entity');

function updateAdvertiserPrePay(install){
    O.saveAdvertiserPrePay( install );
    A.updateAdvertiserPrePay( install );
}

module.exports = {
    name: c.EVENTS_KEY_NAMES.UPD_ADVERTISER_PREPAY,
    function: function( install ){              
        //When this watcher is triggered we calculate totals
        updateAdvertiserPrePay( install);
    }
};