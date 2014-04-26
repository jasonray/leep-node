var pargv = require('minimist')(process.argv.splice(2));

var express = require('express');
var app = express();
var httpPort = pargv.p || 8888;

var logger = require('bunyan').createLogger({
	name: "server"
});

var morgan = require('morgan');
var morganLogger = morgan('dev');

var http = require('http');

// log the request to stdout
app.use(morganLogger);

// keep track of stats
var activeCallFilterModule = require('./lib/request-filters/active-call-counter');
app.use('/api', activeCallFilterModule.activeCallFilter());

// represents calling to the PDP with 500ms delay
app.use('/api', function(req, res, next) {
	logger.info('PEP invoking PDP');

	http.get({
		hostname: "localhost",
		port: 3000,
		path: "/?delay=500",
		agent: false
	}, function(response) {
		logger.info("Got response from PDP: " + response.statusCode);
		next();
	}).on('error', function(e) {
		logger.info('failed to contact PDP, will fail this request');
		res.status(500).end();
	});
});

app.get('/api/patientdata', function(req, res, next) {
	logger.info('retrieve data from repo');

	http.get({
		hostname: "localhost",
		port: 3000,
		path: "/?delay=2000",
		agent: false
	}, function(response) {
		logger.info("Got response from repo: " + response.statusCode);
		res.end('data');
	}).on('error', function(e) {
		logger.info('failed to contact data, will fail this request');
		res.status(500).end();
	});
});

app.get('/admin/stats', activeCallFilterModule.activeCallResource());

app.listen(httpPort, function() {
	logger.info("now listening on %s", httpPort);
});