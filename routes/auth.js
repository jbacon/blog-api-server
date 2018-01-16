var express = require('express')
var Account = require('../model/accounts')
var bcrypt = require('bcryptjs')
var authUtil = require('../common/authUtil')
var mongoUtil = require('../common/mongoUtil')
var validator = require('validator')
var CustomError = require('../common/errorUtil')
var emailUtil = require('../common/emailUtil')
var configUtil = require('../common/configUtil')
var asyncWrap = require('../common/asyncUtil').asyncWrap
const logger = require('../common/loggingUtil').appLogger
var router = express.Router()

async function respondWithToken(req, res/*, next*/) {
	const user = req.user.toJSON({ includeSensitiveFields: ['email'] })
	const token = await authUtil.createJwt(user)
	res.json({ token: token })
}

/* Authenticate w/ Facebook Token - Verify Facebook Token and exchange for a Local Authentication Token. */
router.post('/facebook/token',
	authUtil.getPassport().authenticate('facebook', { scope: [ 'profile', 'email' ] }),
	asyncWrap(async (req, res, next) => {
		await respondWithToken(req, res, next)
	}))
/* Authenticate w/ Google Token - Verify Facebook Token and exchange for a Local Authentication Token. */
router.post('/google/token',
	authUtil.getPassport().authenticate('google', { scope: [ 'profile', 'email' ] }),
	asyncWrap(async (req, res, next) => {
		await respondWithToken(req, res, next)
	}))
// NOTE: LinkedIn does not support Implicit Grant yet...
// /* Authenticate w/ Facebook Token - Verify Facebook Token and exchange for a Local Authentication Token. */
// router.get('/linkedin/token',
// 	authUtil.getPassport().authenticate('linkedin', { scope: [ 'r_emailaddress', 'r_basicprofile' ] }),
// 	(req, res, next) => {
// 		req.query.token = await authUtil.createJwt(req.user.toJSON())
// 		verifyAndSendToken(req, res, next)
// 	})
/* Authenticate w/ Local Credentials - Exchange valid credentials for a local authentication token.  */
router.post('/email/login',
	authUtil.getPassport().authenticate('local'),
	asyncWrap(async (req, res, next) => {
		await respondWithToken(req, res, next)
	}))
/* Registration Request
	1. Check Account Email Uniqueness
	2. Create New Account JSON object
	3. Create Registration Token w/ Account Payload
	4. Send Email w/ Token embedded in link. */
router.post('/email/register/request', asyncWrap(async (req, res/*, next*/) => {
	var results = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.findOne({
			email: validator.normalizeEmail(req.body.email)
		})
	if(results)
		throw new CustomError({
			message: 'Account with that email already exists!',
			status: 409
		})
	req.body.passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10)
	req.body.password = undefined
	const newAccount = new Account({
		email: req.body.email,
		nameFirst: req.body.nameFirst,
		nameLast: req.body.nameLast,
		passwordHashAndSalt: req.body.passwordHashAndSalt
	})
	const token = await authUtil.createJwt(newAccount.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] }))
	const fragment = 'token='+encodeURIComponent(token)
	const registrationUrl = configUtil.websiteURL+'/auth/email/register/callback#'+fragment
	const email = new emailUtil.Email({
		to: newAccount.email,
		from: configUtil.adminEmail,
		subject: 'Account Registration',
		text: undefined,
		html: `
		<html>
			<body>
				<p>
					Hello,
					<br>
					Thanks for registering an account with my Portfolio web app! (<a href='${configUtil.websiteURL}'>${configUtil.websiteURL}</a>).
					<br>
					<br>
					To complete registration please visit the link below:
					<br>
					<a href='${registrationUrl}'>${registrationUrl}</a>
					<br>
					<br>
					This is an automated email, but feel free to respond with any questions and I will get back to you personally!
					<br>
					<br>
					Cheers,
					<br>
					Josh Bacon
				</p>
			</body>
		</html>
		`
	})
	emailUtil.sendEmail(email)
		.catch((error) => { logger.error('Failed to send email: '+error)})
	res.json(`
		Additional action required!
		To activate your account you must verify your email via the automated confirmation email sent to your address.`)
}))
/* Registration Callback
1. Verify Registration Token.
2. Get Account Details from token payload
3. Create Account
4. Post Auth Token back to user */
router.post('/email/register/callback', asyncWrap(async (req, res, next) => {
	const decodedToken = await authUtil.decodeToken(req.body.token)
	var newAccount = Account.fromJSON(decodedToken.data)
	var result = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.insertOne(newAccount.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] }))
	req.user = Account.fromJSON(result.ops[0])
	await respondWithToken(req, res, next)
}))
/* Request PasswordReset Email - Send email to specified address including a link w/ a temporary passwordreset token.*/
router.post('/email/password-reset/request', asyncWrap(async (req, res/*, next*/) => {
	const results = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.findOne({
			email: validator.normalizeEmail(req.body.email)
		})
	if(!results)
		throw new CustomError({
			message: 'Account not found!',
			status: 404
		})
	const account = Account.fromJSON(results)
	const user = account.toJSON({ includeSensitiveFields: ['email'] })
	const token = await authUtil.createJwt({ type: 'password-reset', user: user })
	const fragment = 'token='+encodeURIComponent(token)
	const passwordResetUrl = configUtil.websiteURL+'/auth/email/password-reset/callback#'+fragment
	var email = new emailUtil.Email({
		to: account.email,
		from: configUtil.adminEmail,
		subject: 'Forgot Password',
		text: undefined,
		html: `
		<html>
			<body>
				<p>
					Hello,
					<br>
					You have requested a password reset on my blog website <a href='${configUtil.websiteURL}'>${configUtil.websiteURL}</a>.
					<br>
					<br>
					To reset your password, click the following temporary link before it expires (20min):
					<br>
					<a href='${passwordResetUrl}'>${passwordResetUrl}</a>
					<br>
					<br>
					This is an automated email, but feel free to respond with any questions and I will get back to you personally!
					<br>
					<br>
					Cheers,
					<br>
					Josh Bacon
				</p>
			</body>
		</html>
		`
	})
	emailUtil.sendEmail(email)
		.catch((error) => { logger.error('Failed to send email: '+error)})
	res.json('A temporary password reset link has been sent to your email address')
}))
/* Password Reset Email Callback
1. Verify Reset Token.
2. Generate new Password
3. Reset Account Password
4. Send Email w/ New Password */
router.post('/email/password-reset/callback', asyncWrap(async (req, res, next) => {
	const decodedToken = await authUtil.decodeToken(decodeURIComponent(req.body.token))
	if(decodedToken.data.type !== 'password-reset')
		throw new CustomError({
			message: 'The token provided is not the valid type.',
			status: 403
		})
	const account = Account.fromJSON(decodedToken.data.user)
	const newPassword = req.body.password
	var newPasswordHashAndSalt = bcrypt.hashSync(newPassword, 10)
	var result = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.findOneAndUpdate(
			{
				_id: mongoUtil.normalizeID(account._id)
			},
			{
				$set: {
					passwordHashAndSalt: newPasswordHashAndSalt
				}
			}
		)
	req.user = Account.fromJSON(result.value)
	await respondWithToken(req, res, next)
}))
/* Silently send a registration request Email to the specified Anonymous User
	containing a  callback link with a special JWT to the browser which will let the new User
	enter a password can complete registration.
	1. Create new Account Object
	2. Generate JWT w/ "silent-registration"
	3. Send Email w/ Link to Web App Browser
	*/
router.post('/email/silent-registration/request', authUtil.ensureAuthenticated, authUtil.ensureAdmin, asyncWrap(async (req, res/*, next*/) => {
	authUtil.emailSilentRegistration({
		email: req.body.email,
		nameFirst: req.body.nameFirst,
		nameLast: req.body.nameLast
	})
		.catch((error) => {
			logger.error('Failed to send silent registration email. '+error)
		})
	res.json('A temporary registration link is being sent to your email. May take up to 5 minutes for email to be received.')
}))
/* Callback for completing silent-registration by verifying special silent-registration auth token
	and the new user's password which allwos us to create a new account and send JWT back to user.
	1. Decrypt JWT & verify "silent-registration" token
	2. Deserialize Account Object
	3. Set Password
	4. Database Insert new Account
	5. Set req.user
	6. Generate Auth Token
	7. Respond Auth Token
	*/
router.post('/email/silent-registration/callback', asyncWrap(async (req, res, next) => {
	const decodedToken = await authUtil.decodeToken(decodeURIComponent(req.body.token))
	if(decodedToken.data.type !== 'silent-registration')
		throw new CustomError({
			message: 'The token provided is not the valid type.',
			status: 403
		})
	var newAccount = Account.fromJSON(decodedToken.data.user)
	if(!validator.isAlphanumeric(req.body.password))
		throw new CustomError({
			message: 'New password should be alphanumeric...',
			status: 400
		})
	newAccount.passwordHashAndSalt = bcrypt.hashSync(req.body.password, 10)
	var result = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.insertOne(newAccount.toJSON({ includeSensitiveFields: ['email','passwordHashAndSalt'] }))
	req.user = Account.fromJSON(result.ops[0])
	await respondWithToken(req, res, next)
}))

module.exports = router