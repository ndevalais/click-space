var config = require('../modules/config');
const cluster = require('express-cluster');
let memored = require('memored');

if(config.RUN_SINGLE_INSTANCE === "true"){
	runNewInstance();
}else{
	cluster(function(worker) {		
		//Paso a config el worker id de este proceso
		config.WORKER_ID= worker ? worker.id : 0;
		if (worker.id==1){
			console.log("Started new parent server thread...");        
		}
		runNewInstance();
	}, {count: config.SERVER_THREAD_NUMS});	
}

function runNewInstance(worker){
	var instance = new require('./server.js');	
	instance.start(config.SERVER_LISTENING_PORT, function(err, app, http) {			 
		if(!err) {
			console.log("WORKER #", config.WORKER_ID , ">>>> START => Listening on port " + config.SERVER_LISTENING_PORT);
		}else{
			console.log("**** ERROR Starting worker:", err);
		}
	});
}
