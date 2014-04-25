var pargv = require('minimist')(process.argv.splice(2));

var express = require('express');
var app = express();
var httpPort = pargv.p || 8888;

var logger = require('bunyan').createLogger({
	name: "server"
});

var morgan = require('morgan');
var morganLogger = morgan('dev');

var rest = require('restler');


// log the request to stdout
app.use(morganLogger);

// keep track of stats
var activeCallFilterModule = require('./lib/request-filters/active-call-counter');
app.use('/api', activeCallFilterModule.activeCallFilter());

// represents calling to the PDP with 500ms delay
app.use('/api', function(req, res, next) {
	logger.info('PEP invoking PDP');

	rest.get("http://127.0.0.1:3000/?delay=500")
		.on('complete', function(result, response) {
			if (result instanceof Error) {
				logger.info("Got failed response from PDP: " + response.statusCode);
				next();
			} else {
				logger.info("Got response from PDP: " + response.statusCode);
				next();
			}
		});
});

app.get('/api/patientdata', function(req, res, next) {
	logger.info('retrieve data from repo');

	rest.get("http://127.0.0.1:3000/?delay=2000")
		.on('complete', function(result, response) {
			if (result) {
				res.statusCode(500).end();
			} else {
				logger.info("Got response from repo: " + response.statusCode);
				res.end('data');
			}
		});
});

app.get('/admin/stats', activeCallFilterModule.activeCallResource());

app.listen(httpPort, function() {
	logger.info("now listening on %s", httpPort);
});