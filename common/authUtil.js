var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
var commonConfig = require('../common/configUtil')
var Account = require('../model/accounts')
var passport = require('passport') // Authentication Framework
var LocalStrategy = require('passport-local').Strategy // Authentication Strategy
var JwtStrategy = require('passport-jwt').Strategy
var CustomError = require('../common/errorUtil')
var mongoUtil = require('../common/mongoUtil')
var FacebookTokenStrategy = require('passport-facebook-token')
var GoogleTokenStrategy = require('passport-google-token').Strategy
var asyncWrap = require('../common/asyncUtil').asyncWrap
// var LinkedInTokenStratey = require('passport-linkedin-oauth2').Strategy //Not able to use for login, doesn't support implicit grant
var crypto = require('crypto')

exports.getPassport = function() {
	return passport
}
exports.extractJwt = function(req) {
	var token = null
	if(req)
	{
		const headers = req.headers
		if(headers) {
			const authorization = headers['authorization']
			if(authorization) {
				const bearer = authorization.startsWith('Bearer ')
				if(bearer) {
					token = authorization.substring(7)
				}
			}
		}
	}
	return token
}
exports.decodeToken = async function(token) {
	var decoded = jwt.verify(token, commonConfig.jwtSecret)
	return decoded
}
exports.createJwt = async function(data) {
	const expiration = Math.floor(Date.now() / 1000) + (60 * 60)
	const token = jwt.sign(
		{
			exp: expiration,
			data: data
		},
		commonConfig.jwtSecret)
	return token
}
exports.generatePassword = async function() {
	return crypto.randomBytes(16).toString('hex')
}
exports.ensureAdmin = asyncWrap(async (req, res, next) => {
	await exports.ensureAuthenticated(req, res)
	if(!req.user)
		throw new CustomError({
			message: 'You are not logged in',
			status: 401
		})
	if(req.user.email !== commonConfig.adminEmail)
		throw new CustomError({
			message: 'Your account does not have administrative priviledges',
			status: 401
		})
	next()
})
exports.ensureAuthenticated = asyncWrap(async (req, res, next) => {
	return new Promise((resolve, reject) => {
		passport.authenticate(
			[ 'jwt' ],
			(err, user, info) => {
				if(err) {
					reject(new CustomError({
						message: 'JWT verification failed.',
						status: 500,
						err: err
					}))
				}
				else if(!user) {
					reject(new CustomError({
						message: 'JWT invalid, no user match.',
						statsu: 401,
						err: info
					}))
				}
				else {
					req.logIn(user, (err) => {
						if(err) {
							reject(new CustomError({
								message: 'JWT valid, but failed to login user',
								statsu: 500,
								err: err
							}))
						}
						else {
							resolve()
						}
					})
				}
			})(req, res, next)
	})
		.then(next)
})

passport.serializeUser((accountObject, done) => {
	done(null, JSON.stringify(accountObject))
})
passport.deserializeUser((accountString, done) => {
	const accountJson = JSON.parse(accountString)
	const accountClass = Account.fromJSON(accountJson)
	done(null, accountClass)
})

// Authenticates client provided 'JWT token' validity...
// This middleware is called on each request to ensure token validity,
// because it does not query any databases/apis to check user credentials.
// (A valid token already implies trust and authentication!!!!)
passport.use('jwt', new JwtStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true,
	session: false,
	failWithError: true,
	secretOrKey: commonConfig.jwtSecret,
	jwtFromRequest: exports.extractJwt
},
(req, jwt_payload, next) => {
	// payload contains entire account data.
	// If this function is reach it is already implied that
	// the user is authenticated via a valid signed token found in the auth header.
	var user = Account.fromJSON(jwt_payload.data)
	// Refresh jwt... if needed? (bad practice, because otherwise tokens would never expire..)
	next(null, user)
}))
// Authenticates client provided credentials validity against my custom MongoDB
passport.use('local', new LocalStrategy(
	{
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true,
		failWithError: true,
		session: false
	},
	(req, email, password, next) => {
		email = decodeURIComponent(email)
		password = decodeURIComponent(password)
		mongoUtil.getDb()
			.collection(Account.COLLECTION_NAME)
			.findOne({
				email: email
			})
			.then((result) => {
				if(!result)
					throw new CustomError({
						message: 'Account not found!',
						status: 404
					})
				return Account.fromJSON(result)
			})
			.then((account) => {
				if(account.passwordHashAndSalt) {
					// Account has a local password (therefore it has been email verified)
					return bcrypt.compare(password, account.passwordHashAndSalt)
						.then((result) => {
							if(!result)
								throw new CustomError({
									message: 'Incorrect Password!',
									status: 401
								})
							return account
						})
				}
				// Account does not have a local password BUT it has social account link.
				throw new CustomError({
					message: 'This account was registered via an external Social Media service, login using with the appropriate social account and then create separate/new login credentials for your account.',
					status: 401
				})
			})
			.then((account) => {
				next(null, account)
			})
			.catch((err) => {
				next(err)
			})
	})
)

passport.use('google', new GoogleTokenStrategy({
	clientID: commonConfig.googleAppID,
	clientSecret: commonConfig.googleAppSecret,
	passReqToCallback: true,
	failWithError: true,
	session: false
}, function(req, accessToken, refreshToken, profile, next) {
	socialAuthencationHandler('google', profile)
		.then((account) => { next(null, account) })
		.catch(next)
}))
// Authenticates client provided 'Facebook token' validity
// This middleware queries the facebook GraphAPI to return facebook account details,
// therefore this is only called on initial login (not each request).
passport.use('facebook', new FacebookTokenStrategy({
	clientID: commonConfig.facebookAppID,
	clientSecret: commonConfig.facebookAppSecret,
	passReqToCallback: true,
	session: false,
	failWithError: true,
	profileFields: ['id', 'displayName', 'photos', 'email', 'first_name', 'last_name' ]
},
function(req, accessToken, refreshToken, profile, next) {
	socialAuthencationHandler('facebook', profile)
		.then((account) => { next(null, account) })
		.catch(next)
}))
async function socialAuthencationHandler(socialProfileType, profile) {
	/*
	1. Create new account if none exists
	2. Verify existing account emails match
	3. Update existing acccount social profile ID
	4. Return account
	*/
	var account = null
	const emailsList = (profile.emails && profile.emails.length > 0) ? profile.emails.map((item) => { return item.value }) : []
	const existingAccount = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.findOne({
			$or: [
				{ [socialProfileType+'ProfileID']: profile.id },
				{ email: { $in: emailsList } } ]
		})
	if(existingAccount) {
		account = Account.fromJSON(existingAccount)
	}
	else {
		// CREATE NEW ACCOUNT
		const newAccount = new Account({
			[socialProfileType+'ProfileID']: profile.id,
			nameFirst: profile.name.givenName,
			nameLast: profile.name.familyName,
			email: profile.emails[0].value
		})
		var resultsInsertOne = await mongoUtil.getDb()
			.collection(Account.COLLECTION_NAME)
			.insertOne(newAccount.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] }))
		account = Account.fromJSON(resultsInsertOne.ops[0])
	}
	if(emailsList.indexOf(account.email) === -1)
		throw new CustomError({
			message: 'This social profile matches an existing account by profile ID, but the social profile\'s email list is empty.'
		})
	if(account.email !== emailsList[emailsList.indexOf(account.email)])
		throw new CustomError({
			message: 'This social profile matches an existing account by profile ID, but the email on record does not match any emails in the social profile\'s email list.'
		})
	if(account[socialProfileType+'ProfileID'] !== profile.id) {
		account[socialProfileType+'ProfileID'] = profile.id
		var resultsUpdateOne = await mongoUtil.getDb()
			.collection(Account.COLLECTION_NAME)
			.findOneAndUpdate({
				_id: account._id
			},
			{
				$set: {
					[ socialProfileType+'ProfileID' ]: account[socialProfileType+'ProfileID']
				}
			})
		account = Account.fromJSON(resultsUpdateOne.value)
	}
	return account
}