// Add this to the VERY top of the first file loaded in your app
var config = require('../modules/config');
if (config.APM_ENABLED == "true") {
	console.log(`Habilitando APM: Server ${config.APM_SERVER_URL}`);
	const apm = require('elastic-apm-node').start({
		// Override service name from package.json
		// Allowed characters: a-z, A-Z, 0-9, -, _, and space
		serviceName: config.APM_SERVICE_NAME,
		// Use if APM Server requires a token
		secretToken: config.APM_SERVER_TOKEN,
		serverUrl: config.APM_SERVER_URL,
		transactionSampleRate: config.APM_AGENT_TRANSACTION_SAMPLE_RATE,
		captureSpanStackTraces:config.APM_AGENT_CAPTURE_SPAN_STACK_TRACES,
		logLevel: 'error',
		serverTimeout: "10s",
		captureExceptions: false,
		sourceLinesErrorAppFrames: 0,
		sourceLinesErrorLibraryFrames: 0,
		captureErrorLogStackTraces: "messages",
		captureSpanStackTraces: false,
		stackTraceLimit: 0,		
		captureBody:false,
		instrument:true,
		disableInstrumentations:["redis","mysql","mongodb"],
		transactionMaxSpans:0,
		apiRequestTime:"10s",
		apiRequestSize:"1024kb"
	})
}


let express = require('express');
let environment = require('./environment.js');
let app = express();
let server = require('http').createServer(app);

module.exports.start =async function (port, done) {
	try {
		await environment(app);
	} catch (e) {
		process.exit(0);
		throw e;
	}

	var doneServer = function (error) {
		if (!error) {
			return done(null, server);
		} else {
			return done(error, null);
		}
	};

	server.listen(port, null, null, doneServer).on('error', function (e) {
		if (e.code == 'EADDRINUSE') {
			console.log('Address in use. Is the server already running?');
		} else {
			console.log('Start server failed!');
		}
		return doneServer(e);
	});
}