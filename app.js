// this library is for parsing command line params
// this is used in this project for setting the port
var pargv = require('minimist')(process.argv.splice(2));

// initialize the application instance
var express = require('express');
var app = express();

var logger = require('bunyan').createLogger({
	name: "server"
});

// initialize an http instance that we can use
// for invoking other services
var http = require('http');

// log the request to stdout
var morganLogger = require('morgan')('dev');
app.use(morganLogger);

// keep track of usage stats
var metrics = require('statman');
app.use('/api', metrics.httpFilters.metricCollectionFilter);
app.use('/public', metrics.httpFilters.metricCollectionFilter);

// represents calling to the PDP with 500ms delay
app.use('/api', require('./lib/pep').pepfilter);

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

// initialize the http listener 
// for the main service
var httpPort = pargv.p || 8888;
app.listen(httpPort, function() {
	logger.info("now listening on %s", httpPort);
});

// initialize a second app
// to use for a admin service on a separate port
var adminHttpPort = 8889;
var adminapp = express();
adminapp.get('/admin/stats', metrics.httpFilters.metricOutputResource);
adminapp.listen(adminHttpPort, function() {
	logger.info("admin services now listening on %s", adminHttpPort);
});