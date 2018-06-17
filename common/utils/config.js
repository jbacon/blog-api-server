const path = require('path')
const cryptoUtil = require(path.resolve('.', 'common/utils/crypto.js'))
const CustomError = require(path.resolve('.', 'common/utils/error.js'))

function _throw(message) {
	throw new CustomError({message: message})
}

// SETTINGS
const configFile = require(path.resolve('.', 'configs-'+process.env.NODE_ENV+'.json'))
const confPass = process.env.PORTFOLIO_CONFIG_PASSWORD || _throw('Missing environment variable "PORTFOLIO_CONFIG_PASSWORD", which is required for decrypting the config file!')

// CONFIGS - FROM FILE
exports.logPath 				= process.env.PORTFOLIO_LOG_PATH 												|| configFile.logPath 					|| path.resolve('.', 'logs')
exports.jwtSecret 				= cryptoUtil.decrypt(confPass, process.env.PORTFOLIO_JWT_SECRET 				|| configFile.jwtSecret 				|| _throw('Config Missing "jwtSecret"'))
exports.adminEmail 				= process.env.PORTFOLIO_ADMIN_EMAIL 											|| configFile.adminEmail 				|| _throw('Config Missing "adminEmail"')
exports.adminNameFirst 			= process.env.PORTFOLIO_ADMIN_NAME_FIRST 										|| configFile.adminNameFirst 			|| _throw('Config Missing "adminNameFirst"')
exports.adminNameLast 			= process.env.PORTFOLIO_ADMIN_NAME_LAST 										|| configFile.adminNameLast 			|| _throw('Config Missing "adminNameLast"')
exports.adminPassword 			= cryptoUtil.decrypt(confPass, process.env.PORTFOLIO_ADMIN_PASSWORD 			|| configFile.adminPassword 			|| _throw('Config Missing "adminPassword"'))
exports.serverPort 				= process.env.PORTFOLIO_SERVER_PORT 											|| configFile.serverPort 				|| '3000'
exports.serverUrl 				= process.env.PORTFOLIO_SERVER_URL 												|| configFile.serverUrl 				|| 'localhost'
exports.sitePort 				= process.env.PORTFOLIO_SITE_PORT 												|| configFile.sitePort 					|| '8081'
exports.siteUrl 				= process.env.PORTFOLIO_SITE_URL 												|| configFile.siteUrl 					|| 'localhost'
exports.mongoDbUrl 				= cryptoUtil.decrypt(confPass, process.env.PORTFOLIO_MONGODB_URL 				|| configFile.mongoDbUrl 				|| _throw('Config Missing "mongoDbUrl"'))
exports.facebookAppID 			= process.env.PORTFOLIO_FACEBOOOK_APP_ID 										|| configFile.facebookAppID 			|| _throw('Config Missing "facebookAppID"')
exports.facebookAppSecret 		= cryptoUtil.decrypt(confPass, process.env.PORTFOLIO_FACEBOOK_APP_SECRET 		|| configFile.facebookAppSecret 		|| _throw('Config Missing "facebookAppSecret"'))
exports.linkedInAppID 			= process.env.PORTFOLIO_LINKEDIN_APP_ID 										|| configFile.linkedInAppID 			|| _throw('Config Missing "linkedInAppID"')
exports.linkedInAppSecret 		= cryptoUtil.decrypt(confPass, process.env.PORTFOLIO_LINKEDIN_APP_SECRET 		|| configFile.linkedInAppSecret 		|| _throw('Config Missing "linkedInAppSecret"'))
exports.googleAppID 			= process.env.PORTFOLIO_GOOGLE_APP_ID											|| configFile.googleAppID 				|| _throw('Config Missing "googleAppID"')
exports.googleAppSecret 		= cryptoUtil.decrypt(confPass, process.env.PORTFOLIO_GOOGLE_APP_SECRET 			|| configFile.googleAppSecret 			|| _throw('Config Missing "googleAppSecret"'))
exports.googleGmailAccessToken 	= cryptoUtil.decrypt(confPass, process.env.PORTFOLIO_GOOGLE_GMAIL_ACCESS_TOKEN 	|| configFile.googleGmailAccessToken  	|| _throw('Config Missing "googleGmailAccessToken"'))
exports.googleGmailRefreshToken = cryptoUtil.decrypt(confPass, process.env.PORTFOLIO_GOOGLE_GMAIL_REFRESH_TOKEN || configFile.googleGmailRefreshToken 	|| _throw('Config Missing "googleGmailRefreshToken"'))

// CONFIGS - CALCULATED
exports.websiteURL 				= exports.siteUrl+((exports.sitePort) ? ':'+exports.sitePort : '')
