var path = require('path')
var express = require('express')
var Comment = require(path.resolve('.', 'models/comments.js'))
var Account = require(path.resolve('.', 'models/accounts.js'))
var mongodb = require('mongodb')
var mongoUtil = require(path.resolve('.', 'common/utils/mongo.js'))
var commonAuth = require(path.resolve('.', 'common/utils/auth.js'))
var emailUtil = require(path.resolve('.', 'common/utils/email.js'))
var configUtil = require(path.resolve('.', 'common/utils/config.js'))
var CustomError = require(path.resolve('.', 'common/utils/error.js'))
var asyncWrap = require(path.resolve('.', 'common/utils/async.js')).asyncWrap
const logger = require(path.resolve('.', 'common/utils/logging.js')).appLogger
var router = express.Router()

router.post('/create', asyncWrap(async (req, res/*, next*/) => {
	var isAuthenticated = false
	try {
		await commonAuth.ensureAuthenticated(req, res)
		isAuthenticated = true
	}
	catch(error){
		isAuthenticated = false
	}
	var commentNew = new Comment({
		entity: req.body.entity,
		parent: req.body.parent,
		text: req.body.text,
		accountID: (isAuthenticated) ? req.user._id : undefined,
		email: req.body.email,
		nameFirst: req.body.nameFirst,
		nameLast: req.body.nameLast,
		notifyOnReply: req.body.notifyOnReply
	})
	// Verify Email is not already an account
	if(!isAuthenticated) {
		const results = await mongoUtil.getDb()
			.collection(Account.COLLECTION_NAME)
			.findOne({
				email: req.body.email
			})
		if(results) {
			throw new CustomError({
				status: 400,
				message: 'The email you\'ve provided belongs to a verified account holder already, you cannot use this email to comment anonymously! Try logging in.'
			})
		}
		// Don't await, I don't want client to have to wait till the email has been sent
		commonAuth.emailSilentRegistration({
			email: req.body.email,
			nameFirst: req.body.nameFirst,
			nameLast: req.body.nameLast
		})
			.catch((error) => { logger.error('Failed sending email for silent registration. '+error)})
	}
	// Update Parent Comment's Child List w/ New Comment
	var parentComment = undefined
	if(commentNew.parent) {
		const results = await mongoUtil.getDb()
			.collection(Comment.COLLECTION_NAME)
			.findOneAndUpdate(
				{
					_id: commentNew.parent,
					entity: commentNew.entity
				},
				{
					$addToSet: {
						children: mongoUtil.normalizeID(commentNew._id)
					}
				}
			)
		parentComment = Comment.fromJSON(results.value)
		commentNew.ancestors = parentComment.ancestors.concat(commentNew.parent)
	}
	// Insert New Comment
	const results = await mongoUtil.getDb()
		.collection(Comment.COLLECTION_NAME)
		.insertOne(commentNew.toJSON({ includeSensitiveFields: ['email'] }))
	commentNew = Comment.fromJSON(results.ops[0])
	// Notify Parent Commenter via Email
	if(parentComment && parentComment.notifyOnReply) {
		// Check account settings
		if(!(await parentComment.account) || (await parentComment.account).notifyOnMyCommentReplies) {
			const parentCommentEmail = (parentComment.email) ? parentComment.email : (await parentComment.account).email
			const commentNewEmail = (commentNew.email) ? commentNew.email : (await commentNew.account).email
			// Check if same emails
			if(parentCommentEmail !== commentNewEmail) {
				const nameFirst = (await parentComment.account) ? (await parentComment.account).nameFirst: parentComment.nameFirst
				const nameLast = (await parentComment.account) ? (await parentComment.account).nameLast : parentComment.nameLast
				const queryString = 'comment-jump='+encodeURIComponent(commentNew.ancestors.toString()+','+commentNew._id.toString())
				const conversationLink = configUtil.websiteURL+commentNew.entity+'?'+queryString
				const email = new emailUtil.Email({
					to: parentCommentEmail,
					from: configUtil.adminEmail,
					subject: 'Your Comment Received a Reply',
					text: undefined,
					html: `
					<html>
						<body>
							<p>
								Hello ${nameFirst} ${nameLast},<br>
								You've received a reply on your comment left on my tech blog (<a href='${configUtil.websiteURL}'>${configUtil.websiteURL}</a>).
								<br>
								<br>
								View the conversation here:
								<br>
								<a href='${conversationLink}'>${conversationLink}</a>
								<br>
								<br>
								This is an automated email but feel free to respond with any questions and I will get back to you personally!
								<br>
								<br>
								Cheers,
								<br>
								Josh Bacon
							</p>
						</body>
					</html>
					`})
				emailUtil.sendEmail(email)
					.catch((error) => { logger.error('Failed to send email: '+error)})
			}
		}
	}
	res.json('Comment created.')
}))

/**
 * @api {get} /comment/read Read comment records
 * @apiVersion 0.3.0
 * @apiName CommentRead
 * @apiGroup Comment
 * @apiPermission none
 * @apiExample Example Usage:
 *	curl --include --request GET \
 *	--header "Accept: application/json" \
 *	--header "Content-Type: application/json" \
 *	http://localhost:3000/comments/read? \
 *	entity=/2017/november/19/building-a-tech-hub.html \
 *	&parent=null \
 *	&start=newest \
 *	&pageSize=5 \
 *	&sortOrder=-1 \
 *	&pageNum=1 \
 *	&skipOnPage=0
 *
 * @apiDescription Returns comment records corresponding to the request query string parameters.
 *
 * @apiParam {String} 	entity=undefined 		A URL to filter by.
 * @apiParam {String} 	parent=undefined 		MongoDB ID of a Parent Comment ID to filter by.
 * @apiParam {String} 	start=LATEST 				Where to start pagination results. Some 'MongoDB ID' defaults to latest ID in mongo.
 * @apiParam {Integer} 	pageSize=5 					Maximum comments to return in request
 * @apiParam {Integer} 	sortOrder=0 				-1 ascending or 1 descending
 * @apiParam {Integer} 	pageNum=0 					Which page to return
 * @apiParam {Integer} 	skipOnPage=0 				Number of Records to skip on requested pageNum (used for pagination if last query did not return a full page)
 *
 * @apiSuccess {String} id         The new Users-ID.
 *
 * @apiUse CreateUserError
 */
router.get('/read', asyncWrap(async (req, res/*, next*/) => {
	const query = {
		entity: 			(req.query.entity)			? Comment.entityNormalizer(req.query.entity)												: undefined,
		parent: 			(req.query.parent)			? mongoUtil.normalizeID(req.query.parent, { allowNullable: true }) 	: undefined,
		start: 				(req.query.start) 			? mongoUtil.normalizeID(req.query.start) 														: mongodb.ObjectID(),
		pageSize: 		(req.query.pageSize) 		? parseInt(req.query.pageSize)																			: 5,
		sortOrder: 		(req.query.sortOrder) 	? parseInt(req.query.sortOrder.match(/^(1|-1)$/g)[0])								: -1,
		pageNum: 			(req.query.pageNum) 		? parseInt(req.query.pageNum) 																			: 1,
		skipOnPage: 	(req.query.skipOnPage) 	? parseInt(req.query.skipOnPage) 																		: 0
	}

	const results = await mongoUtil.getDb()
		.collection(Comment.COLLECTION_NAME)
		.aggregate([])
		.match({
			_id: (query.sortOrder === -1) ? { $lte: query.start } : { $gt: query.start },
			entity: query.entity,
			parent: query.parent
		})
		.sort({
			_id: query.sortOrder
		})
		.skip(query.pageSize * (query.pageNum - 1))
		.limit(query.pageSize)
		.lookup({
			from: 'accounts',
			localField: 'accountID',
			foreignField: '_id',
			as: '_account'
		})
		.unwind({
			path: '$_account',
			includeArrayIndex: '_accountIndex',
			preserveNullAndEmptyArrays: true
		})
		.toArray()
	const sliced = results.slice(query.skipOnPage)
	const comments = sliced.map((result) => {
		return Comment.fromJSON(result)
	})
	const commentsJsonPromises = comments.map(async (comment) => {
		return await comment.toJSONIncludingVirtuals()
	})
	const commentsJson = await Promise.all(commentsJsonPromises)
	res.json({ data: commentsJson })
}))
router.post('/down-vote', commonAuth.ensureAuthenticated, asyncWrap(async (req, res/*, next*/) => {
	const results = await mongoUtil.getDb()
		.collection(Comment.COLLECTION_NAME)
		.updateOne(
			{
				_id: mongoUtil.normalizeID(req.body._id),
				removed: { $exists: false }
			},
			{
				$addToSet: {
					downVoteAccountIDs: mongoUtil.normalizeID(req.user._id)
				}
			}
		)
	if(results.result.ok !== 1 || results.matchedCount === 0 || results.modifiedCount === 0)
		throw new CustomError({
			message: 'Either you\'ve already down-voted this comment, comment does not exist, or comment has been removed',
			status: 401
		})
	res.json('Comment down voted.')
}))
router.post('/up-vote', commonAuth.ensureAuthenticated, asyncWrap(async (req, res/*, next*/) => {
	const results = await mongoUtil.getDb()
		.collection(Comment.COLLECTION_NAME)
		.updateOne(
			{
				_id: mongoUtil.normalizeID(req.body._id),
				removed: { $exists: false }
			},
			{
				$addToSet: {
					upVoteAccountIDs: mongoUtil.normalizeID(req.user._id)
				}
			}
		)
	if(results.result.ok !== 1 || results.matchedCount === 0 || results.modifiedCount === 0)
		throw new CustomError({
			message: 'Either you\'ve already up-voted this comment, comment does not exist, or comment has been removed',
			status: 401
		})
	res.json('Comment up voted')
}))
router.post('/flag', commonAuth.ensureAuthenticated, asyncWrap(async (req, res/*, next*/) => {
	const results = await mongoUtil.getDb()
		.collection(Comment.COLLECTION_NAME)
		.updateOne(
			{
				_id: mongoUtil.normalizeID(req.body._id),
				removed: { $exists: true }
			},
			{
				$addToSet: {
					flags: mongoUtil.normalizeID(req.user._id)
				}
			}
		)
	if(results.result.ok !== 1 || results.matchedCount === 0 || results.modifiedCount === 0)
		throw new CustomError({
			message: 'Either you\'ve already flagged this comment, comment does not exist, or comment has been removed',
			status: 401
		})
	res.json('Comment flagged')
}))
router.post('/edit', commonAuth.ensureAuthenticated, asyncWrap(async (req, res/*, next*/) => {
	const results = await mongoUtil.getDb()
		.collection(Comment.COLLECTION_NAME)
		.updateOne(
			{
				accountID: mongoUtil.normalizeID(req.user._id),
				_id: mongoUtil.normalizeID(req.body._id),
				removed: { $exists: false },
				children: { $eq: [] }
			},
			{
				$set: {
					text: req.body.text,
					textEditDate: new Date()
				}
			}
		)
	if(results.result.ok !== 1 || results.matchedCount === 0 || results.modifiedCount === 0)
		throw new CustomError({
			message: 'Either the comment could not be found in your account, has been removed, does not exist, or already has child comments (so edits are not allowed).',
			status: 401
		})
	res.json('Comment text updated')
}))
router.post('/notify-on-reply', commonAuth.ensureAuthenticated, asyncWrap(async (req, res/*, next*/) => {
	if(typeof req.body.notifyOnReply !== 'boolean')
		throw new CustomError({
			message: '"notifyOnReply" must be a boolean',
			status: 400
		})
	/*const results = */await mongoUtil.getDb()
		.collection(Comment.COLLECTION_NAME)
		.updateOne(
			{
				accountID: mongoUtil.normalizeID(req.user._id),
				_id: mongoUtil.normalizeID(req.body._id),
			},
			{
				$set: {
					notifyOnReply: req.body.notifyOnReply
				}
			}
		)
	res.json('Comment notifications turned '+(req.body.notifyOnReply) ? 'on' : 'off')
}))
router.post('/mark-removed', commonAuth.ensureAuthenticated, asyncWrap(async (req, res/*, next*/) => {
	const results = await mongoUtil.getDb()
		.collection(Comment.COLLECTION_NAME)
		.updateOne({
			_id: mongoUtil.normalizeID(req.body._id),
			accountID: mongoUtil.normalizeID(req.user._id),
			removed: { $exists: false }
		},
		{
			$set: {
				removed: mongoUtil.normalizeID(req.user._id),
				notifyOnReply: false
			}
		})
	if(results.result.ok !== 1 || results.matchedCount === 0 || results.modifiedCount === 0)
		throw new CustomError({
			message: 'Either the comment could not be found under your account, it has been removed, or does not exist.',
			status: 401
		})
	res.json('Comment marked for removal')
}))

module.exports = router