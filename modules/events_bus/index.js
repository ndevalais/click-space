const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

/**
 * Registers a function to call in case of @eventName
 **/
function callOnEvent(eventName, functionToCall){
    eventEmitter.on(eventName, function(params) {
        process.nextTick(() => {            
            functionToCall(params); 
        });
    });
}

/**
 * Emits an @evenName and sends it a @param
 **/
function emitEvent(eventName, param){
    eventEmitter.emit(eventName, param);
}

module.exports={
     callOnEvent:callOnEvent,
     emitEvent:emitEvent
}



