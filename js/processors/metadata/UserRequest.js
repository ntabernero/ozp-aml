var UserRequest = function() {}

UserRequest.prototype = {
	debugging: false
};

UserRequest.prototype.run = function (req, res) {
	return {
		requestInformation: {
			isAjax: req.xhr,
			clientIp: req.ip,
			host: req.host,
			requestMade: new Date(),
			protocol: req.protocol,
			restPath: req.originalUrl,
			acceptedCharsets: req.acceptedCharsets,
			acceptedLanguages: req.acceptedLanguages,
			server: req.protocol + '://' + req.headers['host'],
			userAgent: req.headers['user-agent']
		}
	};
};

UserRequest.prototype.getQueryFields = function () {
	return ['request_info'];
};

UserRequest.prototype.queryFieldParameters = function () {
	return [{
		type: 'Boolean',
		field: 'request_info',
		example: 'request_info=true',
		description: 'Gives information about a user\'s request to the RESTful services'
	}];
};

//Node.js module export
module.exports = UserRequest;