var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var routesComments = require('./routes/comments')
var routesAuth = require('./routes/auth')
var routesAccounts = require('./routes/accounts')
var commonLogging = require('./common/loggingUtil')
var CustomError = require('./common/errorUtil')
var mongoUtil = require('./common/mongoUtil')
var commonAuth = require('./common/authUtil')
var commonConfig = require('./common/configUtil')
var asyncWrap = require('./common/asyncUtil.js').asyncWrap

mongoUtil.connect(commonConfig.mongoDbUrl)
	.then(mongoUtil.configureDB)
	.catch((error) => { throw error })

var app = express()
app.disable('x-powered-by')
app.use(express.static('./public'))
app.use(favicon(path.join(__dirname, 'favicon.ico')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // Extended true always nested objects in req.body
app.use(cookieParser())
app.use(commonAuth.getPassport().initialize())
// REQUEST LOGGING (BEFORE the routers)
app.use(commonLogging.requestLoggingMiddleware)
// MY MIDDLEWARE
// Allow CORS //https://enable-cors.org/server_expressjs.html
app.use(asyncWrap(async (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Bearer')
	next()
}))
// ROUTERS
app.use('/comments', routesComments)
app.use('/auth', routesAuth)
app.use('/account', routesAccounts)
app.use(asyncWrap(async (/*req, res, next*/) => {
	throw new CustomError({
		message: 'API route not found',
		status: 404
	})
}))
// ERROR LOGGING (AFTER routers BEFORE handlers)
app.use(commonLogging.errorLoggingMiddleware)
// ERROR HANDLERS
app.use(function(err, req, res/*, next*/) {
	commonLogging.appLogger.error(err)
	res.status(err.status || 500)
	var response = null
	if(commonConfig.environment === commonConfig.ENVIRONMENTS.DEV) {
		response = err.message+'\nStack: '+err.stack
	}
	else {
		response = err.message
	}
	res.send(response)
})
module.exports = app