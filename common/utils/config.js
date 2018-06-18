const path = require('path')
const fs = require('fs')
const cryptoUtil = require(path.resolve('.', 'common/utils/crypto.js'))
const CustomError = require(path.resolve('.', 'common/utils/error.js'))

function _throw(message) {
	throw new CustomError({message: message})
}

// SETTINGS
const confPass = process.env.PORTFOLIO_CONFIG_PASSWORD || _throw('Missing environment variable "PORTFOLIO_CONFIG_PASSWORD", which is required for decrypting the config file!')
const configsJsonStringEncodedEncrypted = fs.readFileSync(path.resolve('.', 'configs-'+process.env.NODE_ENV+'.txt')).toString('utf8')
const configsJsonStringEnocded = cryptoUtil.decrypt(confPass, configsJsonStringEncodedEncrypted)
const configsJsonString = Buffer.from(configsJsonStringEnocded, 'base64').toString('ascii')
const configsJson = JSON.parse(configsJsonString)

// CONFIGS - FROM FILE
exports.logPath 				= process.env.PORTFOLIO_LOG_PATH 					|| configsJson.logPath 					|| path.resolve('.', 'logs')
exports.jwtSecret 				= process.env.PORTFOLIO_JWT_SECRET 					|| configsJson.jwtSecret 				|| _throw('Config Missing "jwtSecret"')
exports.adminEmail 				= process.env.PORTFOLIO_ADMIN_EMAIL 				|| configsJson.adminEmail 				|| _throw('Config Missing "adminEmail"')
exports.adminNameFirst 			= process.env.PORTFOLIO_ADMIN_NAME_FIRST 			|| configsJson.adminNameFirst 			|| _throw('Config Missing "adminNameFirst"')
exports.adminNameLast 			= process.env.PORTFOLIO_ADMIN_NAME_LAST 			|| configsJson.adminNameLast 			|| _throw('Config Missing "adminNameLast"')
exports.adminPassword 			= process.env.PORTFOLIO_ADMIN_PASSWORD 				|| configsJson.adminPassword 			|| _throw('Config Missing "adminPassword"')
exports.serverPort 				= process.env.PORTFOLIO_SERVER_PORT 				|| configsJson.serverPort 				|| '3000'
exports.serverUrl 				= process.env.PORTFOLIO_SERVER_URL 					|| configsJson.serverUrl 				|| 'localhost'
exports.sitePort 				= process.env.PORTFOLIO_SITE_PORT 					|| configsJson.sitePort 				|| '8081'
exports.siteUrl 				= process.env.PORTFOLIO_SITE_URL 					|| configsJson.siteUrl 					|| 'localhost'
exports.mongoDbUrl 				= process.env.PORTFOLIO_MONGODB_URL 				|| configsJson.mongoDbUrl 				|| _throw('Config Missing "mongoDbUrl"')
exports.facebookAppID 			= process.env.PORTFOLIO_FACEBOOOK_APP_ID 			|| configsJson.facebookAppID 			|| _throw('Config Missing "facebookAppID"')
exports.facebookAppSecret 		= process.env.PORTFOLIO_FACEBOOK_APP_SECRET 		|| configsJson.facebookAppSecret 		|| _throw('Config Missing "facebookAppSecret"')
exports.linkedInAppID 			= process.env.PORTFOLIO_LINKEDIN_APP_ID 			|| configsJson.linkedInAppID 			|| _throw('Config Missing "linkedInAppID"')
exports.linkedInAppSecret 		= process.env.PORTFOLIO_LINKEDIN_APP_SECRET 		|| configsJson.linkedInAppSecret 		|| _throw('Config Missing "linkedInAppSecret"')
exports.googleAppID 			= process.env.PORTFOLIO_GOOGLE_APP_ID				|| configsJson.googleAppID 				|| _throw('Config Missing "googleAppID"')
exports.googleAppSecret 		= process.env.PORTFOLIO_GOOGLE_APP_SECRET 			|| configsJson.googleAppSecret 			|| _throw('Config Missing "googleAppSecret"')
exports.googleGmailAccessToken 	= process.env.PORTFOLIO_GOOGLE_GMAIL_ACCESS_TOKEN  	|| configsJson.googleGmailAccessToken  	|| _throw('Config Missing "googleGmailAccessToken"')
exports.googleGmailRefreshToken = process.env.PORTFOLIO_GOOGLE_GMAIL_REFRESH_TOKEN 	|| configsJson.googleGmailRefreshToken 	|| _throw('Config Missing "googleGmailRefreshToken"')

// CONFIGS - CALCULATED
exports.websiteURL 				= exports.siteUrl+((exports.sitePort) ? ':'+exports.sitePort : '')
