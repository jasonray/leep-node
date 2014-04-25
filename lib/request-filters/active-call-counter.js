var numberOfActiveCalls = 0;
var totalNumberOfCalls = 0;
var peakNumberOfCalls = 0;

var logger = require('bunyan').createLogger({
	name: "active-call-counter"
});

module.exports = {

	getNumberOfActiveCalls: function() {
		return numberOfActiveCalls;
	},
	getTotalNumberOfCalls: function() {
		return totalNumberOfCalls;
	},

	activeCallFilter: function() {

		return function(req, res, next) {
			logger.info('active calls: ' + (++numberOfActiveCalls) + " s");
			logger.info('total calls: ' + (++totalNumberOfCalls));
			peakNumberOfCalls = Math.max(peakNumberOfCalls, numberOfActiveCalls);
			logger.info('peak calls: ' + peakNumberOfCalls);

			function onEndCall() {
				res.removeListener('finish', onEndCall);
				res.removeListener('close', onEndCall);
				logger.info('active calls: ' + (--numberOfActiveCalls) + " e");
			}

			res.on('finish', onEndCall);
			res.on('close', onEndCall);
			next();
		};

	},

	activeCallResource: function() {
		return function(req, res, next) {
			console.log('inside activeCallResource method');

			var output = "active: " + numberOfActiveCalls + "; total: " + totalNumberOfCalls + "; peak: " + peakNumberOfCalls + " \n";
			res.end(output);
		};

	}

};
