var winston = require('winston')
var expressWinston = require('express-winston')

exports.logger = new (winston.Logger) ( {
	transports: [
		new (winston.transports.Console) ({
			json: true,
			colorize: true,
			level: 'info'
		})
	]
})

exports.requestLoggingMiddleware = expressWinston.logger({
	winstonInstance: exports.logger,
	meta: true, // optional: control whether you want to log the meta data about the request (default to true)
	expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
	colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
	requestFilter: function (req, propName) {
		if(propName == 'headers') {
			const headers = Object.assign({}, req[propName])
			delete headers['authorization']
			return headers
		}
		return req[propName]
	}
})

exports.routerLoggingMiddleware = expressWinston.errorLogger({
	winstonInstance: exports.logger,
	requestFilter: function (req, propName) {
		if(propName == 'headers') {
			const headers = Object.assign({}, req[propName])
			delete headers['authorization']
			return headers
		}
		return req[propName]
	}
})