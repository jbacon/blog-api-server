var Document = require('../model/document')
var mongoUtil = require('../common/mongoUtil')
var CustomError = require('../common/errorUtil')
var validator = require('validator')
var configUtil = require('../common/configUtil')

module.exports = class Account extends Document {
	static get COLLECTION_NAME() {
		return 'accounts'
	}
	constructor(json) {
		super(json)
		this.email 											= (typeof json.email 										!== 'undefined') ? json.email 										: null
		this.nameFirst 									= (typeof json.nameFirst 								!== 'undefined') ? json.nameFirst 								: null
		this.nameLast 									= (typeof json.nameLast 								!== 'undefined') ? json.nameLast 									: null
		this.passwordHashAndSalt 				= (typeof json.passwordHashAndSalt 			!== 'undefined') ? json.passwordHashAndSalt 			: null
		this.facebookProfileID 					= (typeof json.facebookProfileID 				!== 'undefined') ? json.facebookProfileID 				: null
		this.googleProfileID 						= (typeof json.googleProfileID 					!== 'undefined') ? json.googleProfileID 					: null
		this.dateLastAuthenticated 			= (typeof json.dateLastAuthenticated 		!== 'undefined') ? json.dateLastAuthenticated 		: new Date()
		this.notifyOnMyCommentReplies 	= (typeof json.notifyOnMyCommentReplies !== 'undefined') ? json.notifyOnMyCommentReplies 	: true
		this.notifyOnNewArticles 				= (typeof json.notifyOnNewArticles 			!== 'undefined') ? json.notifyOnNewArticles 			: false
		this.followingComments 					= (typeof json.followingComments 				!== 'undefined') ? json.followingComments 				: []
	}
	get facebookProfileID() {
		return this._facebookProfileID
	}
	set facebookProfileID(val) {
		this._facebookProfileID = val
	}
	get googleProfileID() {
		return this._googleProfileID
	}
	set googleProfileID(val) {
		this._googleProfileID = val
	}
	get linkedInProfileID() {
		return this._linkedInProfileID
	}
	set linkedInProfileID(val) {
		this._linkedInProfileID = val
	}
	get email() {
		return this._email
	}
	set email(val) {
		if(val) {
			this._email = validator.normalizeEmail(val)
		}
		else {
			return null
		}
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