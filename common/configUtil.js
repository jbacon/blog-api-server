const cryptoUtil = require('../common/cryptoUtil')
const CustomError = require('../common/errorUtil')

const configs_file_path = process.env.PORTFOLIO_CONFIG_FILE_PATH || (()=>{throw new Error('Config file path environment variable "PORTFOLIO_CONFIG_FILE_PATH" is missing! This is required!')})
const configs = require(configs_file_path)

const password = process.env.PORTFOLIO_CONFIG_PASSWORD || (()=>{throw new Error('Config password environment variable "PORTFOLIO_CONFIG_PASSWORD" is missing! This is required in order to decrypt certain secrets in the config file!')})

exports.ENVIRONMENTS = {
	DEV: 'development',
	PROD: 'production'
}

exports.environment 							= 									 					 process.env.PORTFOLIO_ENVIRONMENT 								|| configs.environment 							|| exports.ENVIRONMENTS.DEV
exports.logPath										=															 process.env.PORTFOLIO_LOG_PATH 									|| configs.logPath 									|| './logs'
exports.jwtSecret 								= cryptoUtil.decrypt(password, process.env.PORTFOLIO_JWT_SECRET 								|| configs.jwtSecret 								|| (()=>{throw new CustomError('Config Missing "jwtSecret"')}))
exports.adminEmail 								= 									  				 process.env.PORTFOLIO_ADMIN_EMAIL 								|| configs.adminEmail 							|| (()=>{throw new CustomError('Config Missing "adminEmail"')})
exports.adminNameFirst 						= 									  				 process.env.PORTFOLIO_ADMIN_NAME_FIRST 					|| configs.adminNameFirst 					|| (()=>{throw new CustomError('Config Missing "adminNameFirst"')})
exports.adminNameLast 						= 									  				 process.env.PORTFOLIO_ADMIN_NAME_LAST 						|| configs.adminNameLast 						|| (()=>{throw new CustomError('Config Missing "adminNameLast"')})
exports.adminPassword 						= cryptoUtil.decrypt(password, process.env.PORTFOLIO_ADMIN_PASSWORD 						|| configs.adminPassword 						|| (()=>{throw new CustomError('Config Missing "adminPassword"')}))
exports.serverPort 								= 									 					 process.env.PORTFOLIO_SERVER_PORT 								|| configs.serverPort 							|| '3000'
exports.serverUrl 								= 									 					 process.env.PORTFOLIO_SERVER_URL 								|| configs.serverUrl 								|| 'localhost'
exports.sitePort 									= 									 					 process.env.PORTFOLIO_SITE_PORT 									|| configs.sitePort 								|| '8081'
exports.siteUrl 									= 									 					 process.env.PORTFOLIO_SITE_URL 									|| configs.siteUrl 									|| 'localhost'
exports.mongoDbUrl 								= 									 					 process.env.PORTFOLIO_MONGODB_URL 								|| configs.mongoDbUrl 							|| 'mongodb://portfolio-db:27017/portfolio'
exports.facebookAppID 						= 														 process.env.PORTFOLIO_FACEBOOOK_APP_ID 					|| configs.facebookAppID 						|| (()=>{throw new CustomError('Config Missing "facebookAppID"')})
exports.facebookAppSecret 				= cryptoUtil.decrypt(password, process.env.PORTFOLIO_FACEBOOK_APP_SECRET 				|| configs.facebookAppSecret 				|| (()=>{throw new CustomError('Config Missing "facebookAppSecret"')}))
exports.linkedInAppID 						= 														 process.env.PORTFOLIO_LINKEDIN_APP_ID 						|| configs.linkedInAppID 						|| (()=>{throw new CustomError('Config Missing "linkedInAppID"')})
exports.linkedInAppSecret 				= cryptoUtil.decrypt(password, process.env.PORTFOLIO_LINKEDIN_APP_SECRET 				|| configs.linkedInAppSecret 				|| (()=>{throw new CustomError('Config Missing "linkedInAppSecret"')}))
exports.googleAppID 							= 														 process.env.PORTFOLIO_GOOGLE_APP_ID							|| configs.googleAppID 							|| (()=>{throw new CustomError('Config Missing "googleAppID"')})
exports.googleAppSecret 					= cryptoUtil.decrypt(password, process.env.PORTFOLIO_GOOGLE_APP_SECRET 					|| configs.googleAppSecret 					|| (()=>{throw new CustomError('Config Missing "googleAppSecret"')}))
exports.googleGmailAccessToken 		= cryptoUtil.decrypt(password, process.env.PORTFOLIO_GOOGLE_GMAIL_ACCESS_TOKEN 	|| configs.googleGmailAccessToken  	|| (()=>{throw new CustomError('Config Missing "googleGmailAccessToken"')}))
exports.googleGmailRefreshToken 	= cryptoUtil.decrypt(password, process.env.PORTFOLIO_GOOGLE_GMAIL_REFRESH_TOKEN || configs.googleGmailRefreshToken 	|| (()=>{throw new CustomError('Config Missing "googleGmailRefreshToken"')}))

exports.websiteURL = exports.siteUrl+((exports.sitePort) ? ':'+exports.sitePort : '')