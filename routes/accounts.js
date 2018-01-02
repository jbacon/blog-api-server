var express = require('express')
var mongoUtil = require('../common/mongoUtil')
var Account = require('../model/accounts')
var validatorUtil = require('../common/validatorUtil')
var commonAuth = require('../common/authUtil')
var CustomError = require('../common/errorUtil')
var bcrypt = require('bcryptjs')
var validator = require('validator')
var asyncWrap = require('../common/asyncUtil').asyncWrap
var router = express.Router()

/**
 * @apiDefine GroupAccounts
 * @apiGroup Accounts
 *
 * @apiError CustomError Something went wrong.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *			 "status": "404",
 *       "message": "Something went wrong",
 *			 "object": "{}"
 *     }
 */

/**
 * @api {post} /account/create Create a new Account
 * @apiVersion 0.3.0
 * @apiName CreateAccount
 * @apiGroup Account
 * @apiPermission admin
 * @apiExample Example Usage:
 *	curl --include --request GET \
 *	--header "Accept: application/json" \
 *	--header "Content-Type: application/json" \
 *	http://localhost:8080/comments/read? \
 *	entity=/2017/november/19/building-a-tech-hub.html \
 *	&parent=null \
 *	&start=newest \
 *	&pageSize=5 \
 *	&sortOrder=-1 \
 *	&pageNum=1 \
 *	&skipOnPage=0
 *
 * @apiDescription Create a new account.
 *
 * @apiParam {String} name Name of the User.
 *
 * @apiSuccess {String} id         The new Users-ID.
 *
 * @apiUse CreateUserError
 */
router.get('/read', commonAuth.ensureAdmin, asyncWrap(async (req, res, next) => {
	if(!validator.isInt(req.query.pageSize))
		throw new CustomError({
			message: 'Value '+req.query.pageSize+' for pageSize is invalid...',
			status: 400
		})
	if(!validator.isInt(req.query.pageNum))
		throw new CustomError({
			message: 'Value '+req.query.pageNum+' for pageNum is invalid...',
			status: 400
		})
	if(req.query.query instanceof Object)
		throw new CustomError({
			message: 'Value '+req.query.query+' for query is invalid...',
			status: 400
		})
	var results = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.find(req.query.query)
		.skip(parseInt(req.query.pageSize) * (parseInt(req.query.pageNum) - 1))
		.limit(parseInt(req.query.pageSize))
		.toArray()
	var comments = results.map((doc) => { return Account.fromJSON(doc) })
	res.json({ data: comments })
}))

router.post('/edit-details', commonAuth.ensureAuthenticated, asyncWrap(async (req, res, next) => {
	if(!validator.isEmail(req.body.email))
		throw new CustomError({
			message: 'Value '+req.body.email+' for email is invalid...',
			status: 400
		})
	if(!validator.isAlpha(req.body.nameFirst))
		throw new CustomError({
			message: 'Value '+req.body.nameFirst+' for nameFirst is invalid...',
			status: 400
		})
	if(!validator.isAlpha(req.body.nameLast))
		throw new CustomError({
			message: 'Value '+req.body.nameLast+' for nameLast is invalid...',
			status: 400
		})
	if(typeof req.body.notifyOnMyCommentReplies !== 'boolean')
		throw new CustomError({
			message: 'Value '+req.body.notifyOnMyCommentReplies+' for notifyOnMyCommentReplies is invalid...',
			status: 400
		})
	var results = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.updateOne(
			{
				_id: validatorUtil.normalizeID(req.user._id)
			},
			{
				$set: {
					email: validator.normalizeEmail(req.body.email),
					nameFirst: req.body.nameFirst,
					nameLast: req.body.nameLast,
					notifyOnMyCommentReplies: req.body.notifyOnMyCommentReplies
				}
			}
		)
	res.json('Account edited')
}))

router.post('/reset-password', commonAuth.ensureAuthenticated, asyncWrap(async (req, res, next) => {
	if(!validator.isAlphanumeric(req.body.oldPassword))
		throw new CustomError({
			message: 'Old password should be alphanumeric...',
			status: 400
		})
	if(!validator.isAlphanumeric(req.body.newPassword))
		throw new CustomError({
			message: 'New password should be alphanumeric...',
			status: 400
		})
	var resultsFindOne = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.findOne({ _id: req.user._id })
	var account = Account.fromJSON(resultsFindOne)
	if(!account.passwordHashAndSalt)
		throw new CustomError({
			message: 'Account does not have a local password to reset, use \'forgot password\' to be sent a new password by email!',
			status: 409
		})
	if(!bcrypt.compareSync(req.body.oldPassword, account.passwordHashAndSalt))
		throw new CustomError({
			message: 'Original password entered is incorrect',
			status: 409
		})
	var newPasswordHashAndSalt = bcrypt.hashSync(req.body.newPassword, 10)
	var resultsUpdateOne = await mongoUtil.getDb()
		.collection(Account.COLLECTION_NAME)
		.updateOne(
			{ _id: validatorUtil.normalizeID(req.user._id) },
			{
				$set: {
					passwordHashAndSalt: newPasswordHashAndSalt
				}
			}
		)
	res.json('Password reset.')
}))
module.exports = router