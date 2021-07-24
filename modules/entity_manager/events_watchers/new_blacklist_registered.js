/**
 * 
 * This event watcher is fire once every click is saved, receives
 * the inserted click onfo as a param
 */

/*
- Llamar al acumulador de totales de blacklist
- 
*/
const c = require ('../../constants');

let OTotal = require('../blacklist_entity');

function registerBlackListTotals(blacklist){
    OTotal.addBlackListTotal(blacklist);
}

module.exports = {
    name: c.EVENTS_KEY_NAMES.NEW_BLACKLIST_REGISTERED,
    function: function(blacklist){              
        //When this watcher is triggered we calculate totals
        registerBlackListTotals(blacklist);
    }
};