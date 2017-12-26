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
var commonMongo = require('./common/mongoUtil')
var commonAuth = require('./common/authUtil')
var commonConfig = require('./common/configUtil')
var asyncWrap = require('./common/asyncUtil.js').asyncWrap

commonMongo.connect(commonConfig.mongoDbUrl)
	.then(commonMongo.configureDB)
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
app.use(asyncWrap(async (req, res, next) => {
	throw new CustomError({
		message: 'API route not found',
		status: 404
	})
}))
// ERROR LOGGING (AFTER routers BEFORE handlers)
app.use(commonLogging.routerLoggingMiddleware)
// ERROR HANDLERS
if (commonConfig.environment == commonConfig.ENVIRONMENTS.DEV) {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500)
		res.send({
			status: err.status || 500,
			message: err.message || 'No message...',
			stack: err.stack || 'No stack trace..'
		})
	})
}
else {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500)
		res.send({
			status: err.status || 500,
			message: err.message || 'No message...'
		})
	})
}
module.exports = app