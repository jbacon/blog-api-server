var path = require('path')
var Document = require(path.resolve('.', 'models/document.js'))
var mongoUtil = require(path.resolve('.', 'common/utils/mongo.js'))
var CustomError = require(path.resolve('.', 'common/utils/error.js'))
var validator = require('validator')
var configUtil = require(path.resolve('.', 'common/utils/config.js'))

module.exports = class Account extends Document {
	static get COLLECTION_NAME() {
		return 'accounts'
	}
	constructor(json) {
		super(json)
		this.email 											= (typeof json.email 										!== 'undefined') ? json.email 										: undefined
		this.nameFirst 									= (typeof json.nameFirst 								!== 'undefined') ? json.nameFirst 								: undefined
		this.nameLast 									= (typeof json.nameLast 								!== 'undefined') ? json.nameLast 									: undefined
		this.passwordHashAndSalt 				= (typeof json.passwordHashAndSalt 			!== 'undefined') ? json.passwordHashAndSalt 			: undefined
		this.facebookProfileID 					= (typeof json.facebookProfileID 				!== 'undefined') ? json.facebookProfileID 				: undefined
		this.googleProfileID 						= (typeof json.googleProfileID 					!== 'undefined') ? json.googleProfileID 					: undefined
		this.dateLastAuthenticated 			= (typeof json.dateLastAuthenticated 		!== 'undefined') ? json.dateLastAuthenticated 		: new Date()
		this.notifyOnMyCommentReplies 	= (typeof json.notifyOnMyCommentReplies !== 'undefined') ? json.notifyOnMyCommentReplies 	: true
		this.notifyOnNewArticles 				= (typeof json.notifyOnNewArticles 			!== 'undefined') ? json.notifyOnNewArticles 			: false
		this.followingComments 					= (typeof json.followingComments 				!== 'undefined') ? json.followingComments 				: []
	}
	get facebookProfileID() {
		return this._facebookProfileID
	}
	set facebookProfileID(val) {
		if(typeof val !== 'string' && val !== undefined)
			throw new CustomError({
				message: 'Invalid entry for facebookProfileID, must be string not alphabetic',
				status: 500
			})
		this._facebookProfileID = val
	}
	get googleProfileID() {
		return this._googleProfileID
	}
	set googleProfileID(val) {
		if(typeof val !== 'string' && val !== undefined)
			throw new CustomError({
				message: 'Invalid entry for googleProfileID, must be string not alphabetic',
				status: 500
			})
		this._googleProfileID = val
	}
	get linkedInProfileID() {
		return this._linkedInProfileID
	}
	set linkedInProfileID(val) {
		if(typeof val !== 'string' && val !== undefined)
			throw new CustomError({
				message: 'Invalid entry for linkedInProfileID, must be string not alphabetic',
				status: 500
			})
		this._linkedInProfileID = val
	}
	get email() {
		return this._email
	}
	set email(val) {
		this._email = validator.normalizeEmail(val)
	}
	get isAdmin() {
		if(this._email === configUtil.adminEmail)
			return true
		else
			return false
	}
	get nameFirst() {
		return this._nameFirst
	}
	set nameFirst(val) {
		if(typeof(val) !== 'string')
			throw new CustomError({
				message: 'Invalid entry... not of type string',
				status: 500
			})
		if(!validator.isAlpha(val))
			throw new CustomError({
				message: 'Invalid entry... string not alphabetic',
				status: 500
			})
		this._nameFirst = val
	}
	get nameLast() {
		return this._nameLast
	}
	set nameLast(val) {
		if(typeof(val) !== 'string')
			throw new CustomError({
				message: 'Invalid entry... not of type string',
				status: 500
			})
		if(!validator.isAlpha(val))
			throw new CustomError({
				message: 'Invalid entry... string not alphabetic',
				status: 500
			})
		this._nameLast = val
	}
	get notifyOnMyCommentReplies() {
		return this._notifyOnMyCommentReplies
	}
	set notifyOnMyCommentReplies(val) {
		if(typeof val !== 'boolean')
			throw new CustomError({
				message: 'Invalid entry for notifyOnMyCommentReplies, must be a boolean',
				status: 500
			})
		this._notifyOnMyCommentReplies = val
	}
	get followingComments() {
		return this._followingComments
	}
	set followingComments(val) {
		this._followingComments = mongoUtil.normalizeArrayIDs(val)
	}
	get notifyOnNewArticles() {
		return this._notifyOnNewArticles
	}
	set notifyOnNewArticles(val) {
		if(typeof val !== 'boolean')
			throw new CustomError({
				message: 'Invalid entry for notifyOnMyCommentReplies, must be a boolean',
				status: 500
			})
		this._notifyOnNewArticles = val
	}
	get passwordHashAndSalt() {
		return this._passwordHashAndSalt
	}
	set passwordHashAndSalt(val) {
		if(typeof val !== 'string' && val !== undefined)
			throw new CustomError({
				message: 'Invalid entry for passwordHashAndSalt, must be a string or undefined',
				status: 500
			})
		this._passwordHashAndSalt = val
	}
	get dateLastAuthenticated() {
		return this._dateLastAuthenticated
	}
	set dateLastAuthenticated(val) {
		this._dateLastAuthenticated = val
	}
	async toJSONIncludingVirtuals({ includeSensitiveFields=[] } = {}) {
		var obj = await super.toJSONIncludingVirtuals({ includeSensitiveFields: includeSensitiveFields })
		obj.facebookProfileID = this.facebookProfileID
		obj.googleProfileID = this.googleProfileID
		if(includeSensitiveFields.includes('email'))
			obj.email = this.email
		obj.isAdmin = this.isAdmin
		obj.nameFirst = this.nameFirst
		obj.nameLast = this.nameLast
		if(includeSensitiveFields.includes('passwordHashAndSalt'))
			obj.passwordHashAndSalt = this.passwordHashAndSalt
		obj.dateLastAuthenticated = this.dateLastAuthenticated
		obj.notifyOnMyCommentReplies = this.notifyOnMyCommentReplies
		obj.notifyOnNewArticles = this.notifyOnNewArticles
		obj.followingComments = this.followingComments
		return obj
	}
	toJSON({ includeSensitiveFields=[] } = {}) {
		var obj = super.toJSON({ includeSensitiveFields: includeSensitiveFields })
		obj.facebookProfileID = this.facebookProfileID
		obj.googleProfileID = this.googleProfileID
		if(includeSensitiveFields.includes('email'))
			obj.email = this.email
		obj.isAdmin = this.isAdmin
		obj.nameFirst = this.nameFirst
		obj.nameLast = this.nameLast
		if(includeSensitiveFields.includes('passwordHashAndSalt')) obj.passwordHashAndSalt = this.passwordHashAndSalt
		obj.dateLastAuthenticated = this.dateLastAuthenticated
		obj.notifyOnMyCommentReplies = this.notifyOnMyCommentReplies
		obj.notifyOnNewArticles = this.notifyOnNewArticles
		obj.followingComments = this.followingComments
		return obj
	}
}