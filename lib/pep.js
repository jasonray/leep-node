var logger = require('bunyan').createLogger({
	name: "pep"
});

var http = require('http');

exports.pepfilter = function(req, res, next) {
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
};