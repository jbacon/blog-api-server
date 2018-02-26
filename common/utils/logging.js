var path = require('path')
var winston = require('winston')
var expressWinston = require('express-winston')
var configUtil = require(path.resolve('.', 'common/utils/config.js'))
// const fs = require('fs')
const { execSync } = require('child_process')

execSync('mkdir -p '+configUtil.logPath)

exports.appLogger = new (winston.Logger) ( {
	transports: [
		new (winston.transports.File) ({
			json: true,
			colorize: true,
			level: 'info',
			filename: configUtil.logPath+'/app.log',
			maxsize: 2000000,
			maxFiles: 10,
			tailable: true
		}),
		new (winston.transports.Console) ({
			json: false,
			colorize: true,
			level: 'info'
		})
	]
})
exports.requestLoggingMiddleware = expressWinston.logger({
	winstonInstance: new (winston.Logger) ( {
		transports: [
			new (winston.transports.File) ({
				json: true,
				colorize: true,
				level: 'info',
				filename: configUtil.logPath+'/requests.log',
				maxsize: 2000000,
				maxFiles: 10,
				tailable: true
			})
		]
	}),
	meta: true, // optional: control whether you want to log the meta data about the request (default to true)
	expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
	colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
	requestFilter: requestFilter
})
exports.errorLoggingMiddleware = expressWinston.errorLogger({
	winstonInstance: new (winston.Logger) ( {
		transports: [
			new (winston.transports.File) ({
				json: true,
				colorize: true,
				level: 'info',
				filename: configUtil.logPath+'/errors.log',
				maxsize: 2000000,
				maxFiles: 10,
				tailable: true
			})
		]
	}),
	requestFilter: requestFilter
})
function requestFilter(req, propName) {
	if(propName == 'headers') {
		const headers = Object.assign({}, req[propName])
		delete headers['authorization']
		return headers
	}
	return req[propName]
}