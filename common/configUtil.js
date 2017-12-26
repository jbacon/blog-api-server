const DEFAULT_CONFIG_FILE='./configs.json.template'

const CONFIG_FILE = process.env.PORTFOLIO_CONFIG_FILE || DEFAULT_CONFIG_FILE

const configs = require('../'+CONFIG_FILE)

exports.ENVIRONMENTS = {
	DEV: 'development',
	PROD: 'production'
}

exports.environment 							= process.env.PORTFOLIO_NODE_ENV 										|| configs.environment
exports.jwtSecret 								= process.env.PORTFOLIO_JWT_SECRET 									|| configs.jwtSecret
exports.adminEmail 								= process.env.PORTFOLIO_ADMIN_EMAIL 								|| configs.adminEmail
exports.adminNameFirst 						= process.env.PORTFOLIO_ADMIN_NAME_FIRST 						|| configs.adminNameFirst
exports.adminNameLast 						= process.env.PORTFOLIO_ADMIN_NAME_LAST 						|| configs.adminNameLast
exports.adminPassword 						= process.env.PORTFOLIO_ADMIN_PASSWORD 							|| configs.adminPassword
exports.serverPort 								= process.env.PORTFOLIO_SERVER_PORT 								|| configs.serverPort
exports.serverUrl 								= process.env.PORTFOLIO_SERVER_URL 									|| configs.serverUrl
exports.sitePort 									= process.env.PORTFOLIO_SITE_PORT 									|| configs.sitePort
exports.siteUrl 									= process.env.PORTFOLIO_SITE_URL 										|| configs.siteUrl
exports.mongoDbUrl 								= process.env.PORTFOLIO_MONGODB_URL 								|| configs.mongoDbUrl
exports.facebookAppID 						= process.env.PORTFOLIO_FACEBOOOK_APP_ID 						|| configs.facebookAppID
exports.facebookAppSecret 				= process.env.PORTFOLIO_FACEBOOK_APP_SECRET 				|| configs.facebookAppSecret
exports.linkedInAppID 						= process.env.PORTFOLIO_LINKEDIN_APP_SECRET 				|| configs.linkedInAppID
exports.linkedInAppSecret 				= process.env.PORTFOLIO_LINKEDIN_APP_SECRET 				|| configs.linkedInAppSecret
exports.googleAppID 							= process.env.PORTFOLIO_GOOGLE_APP_SECRET 					|| configs.googleAppID
exports.googleAppSecret 					= process.env.PORTFOLIO_GOOGLE_APP_SECRET 					|| configs.googleAppSecret
exports.googleGmailAccessToken 		= process.env.PORTFOLIO_GOOGLE_GMAIL_ACCESS_TOKEN 	|| configs.googleGmailAccessToken
exports.googleGmailRefreshToken 	= process.env.PORTFOLIO_GOOGLE_GMAIL_REFRESH_TOKEN 	|| configs.googleGmailRefreshToken

exports.websiteURL = exports.siteUrl+((exports.sitePort) ? ':'+exports.sitePort : '')