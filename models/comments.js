var path = require('path')
var mongoUtil = require(path.resolve('.', 'common/utils/mongo.js'))
var Document = require(path.resolve('.', 'models/document.js'))
var Account = require(path.resolve('.', 'models/accounts.js'))
var validator = require('validator')
var CustomError = require(path.resolve('.', 'common/utils/error.js'))

module.exports = class Comment extends Document {
	static get COLLECTION_NAME() {
		return 'comments'
	}
	constructor(json) {
		// Set Default & Initials
		super(json)
		this.entity 						= json.entity
		this.children 					= (typeof json.children 					!== 'undefined') ? json.children 												: []
		this.ancestors 					= (typeof json.ancestors 					!== 'undefined') ? json.ancestors 											: []
		this.parent 						= (typeof json.parent 						!== 'undefined') ? json.parent 													: undefined
		this._parentComment 		= (typeof json.parentComment 			!== 'undefined') ? Comment.fromJSON(json.parentComment) : undefined
		this.text 							= json.text
		this.textEditDate 			= (typeof json.textEditDate 			!== 'undefined') ? json.textEditDate 										: undefined
		this.accountID 					= (typeof json.accountID 					!== 'undefined') ? json.accountID 											: undefined
		this._account 					= (typeof json.account 						!== 'undefined') ? Account.fromJSON(json.account) 			: undefined
		this.email 							= (typeof json.email 							!== 'undefined') ? json.email 													: undefined
		this.nameFirst 					= (typeof json.nameFirst 					!== 'undefined') ? json.nameFirst 											: undefined
		this.nameLast 					= (typeof json.nameLast 					!== 'undefined') ? json.nameLast 												: undefined
		this.notifyOnReply 			= (typeof json.notifyOnReply			!== 'undefined') ? json.notifyOnReply 									: true
		this.upVoteAccountIDs 	= (typeof json.upVoteAccountIDs  	!== 'undefined') ? json.upVoteAccountIDs 								: []
		this.downVoteAccountIDs = (typeof json.downVoteAccountIDs !== 'undefined') ? json.downVoteAccountIDs 							: []
		this.flags 							= (typeof json.flags 							!== 'undefined') ? json.flags 													: []
		this.removed 						= (typeof json.removed  					!== 'undefined') ? json.removed 												: undefined
	}
	get accountID() {
		return this._accountID
	}
	set accountID(val) {
		if(val && (this.email || this.nameFirst || this.nameLast))
			throw new CustomError({
				message:'Invalid accountID. You cannot set accountID when any one of: email, nameFirst, or nameLast... have already been set to values.',
				status: 400
			})
		this._accountID = mongoUtil.normalizeID(val, { allowNullable: true })
	}
	// Virtual Account
	get account() {
		return (async () => {
			if(this.accountID) {
				if(this._account && this._account._id === this.accountID) {
					return this._account
				}
				else {
					// Refresh/Search account (mismatch ID)
					const result = await mongoUtil.getDb()
						.collection(Account.COLLECTION_NAME)
						.findOne({
							_id: this.accountID
						})
					return Account.fromJSON(result)
				}
			}
			else {
				return undefined
			}
		})()
	}
	get text() {
		return this._text
	}
	set text(val) {
		this._text = val
	}
	get textEditDate() {
		return this._textEditDate
	}
	set textEditDate(val) {
		var result = undefined
		if(val !== undefined)
			result = new Date(val)
		this._textEditDate = result
	}
	get email() {
		return this._email
	}
	set email(val) {
		const normalized = Comment.emailNormalizer(val)
		if(this.accountID && normalized)
			throw new CustomError({
				message: 'Invalid email. Must be undefined because AccountID has already been set.',
				status: 500
			})
		if(!this.accountID && !normalized)
			throw new CustomError({
				message: 'Invalid email. Cannot be undefined when AccountID is also undefined.',
				status: 500
			})
		this._email = normalized
	}
	static emailNormalizer(val) {
		if(val !== undefined && !validator.isEmail(val))
			throw new CustomError({
				message: 'Invalid email. Must be either undefined or valid email address.',
				status: 400
			})
		if(val === undefined)
			return undefined
		return validator.normalizeEmail(val)
	}
	get nameFirst() {
		return this._nameFirst
	}
	set nameFirst(val) {
		const normalized = Comment.nameFirstNormalizer(val)
		if(this.accountID && normalized)
			throw new CustomError({
				message: 'Invalid nameFirst. Must be undefined because AccountID has already been set.',
				status: 500
			})
		if(!this.accountID && !normalized)
			throw new CustomError({
				message: 'Invalid nameFirst. Cannot be undefined when AccountID is also undefined.',
				status: 500
			})
		this._nameFirst = normalized
	}
	static nameFirstNormalizer(val) {
		if(val !== undefined && typeof val !== 'string' && validator.isAlpha(val))
			throw new CustomError({
				message: 'Invalid nameFist. Must be either undefined or alphabetic string.',
				status: 400
			})
		if(val === undefined)
			return undefined
		return val.toUpperCase()
	}
	get nameLast() {
		return this._nameLast
	}
	set nameLast(val) {
		const normalized = Comment.nameLastNormalizer(val)
		if(this.accountID && normalized)
			throw new CustomError({
				message: 'Invalid nameLast. Must be undefined because AccountID has already been set.',
				status: 500
			})
		if(!this.accountID && !normalized)
			throw new CustomError({
				message: 'Invalid nameLast. Cannot be undefined when AccountID is also undefined.',
				status: 500
			})
		this._nameLast = normalized
	}
	static nameLastNormalizer(val) {
		if(val !== undefined && typeof val !== 'string' && validator.isAlpha(val))
			throw new CustomError({
				message: 'Invalid nameLast. Must be either undefined or alphabetic string.',
				status: 400
			})
		if(val === undefined)
			return undefined
		return val.toUpperCase()
	}
	get notifyOnReply() {
		return this._notifyOnReply
	}
	set notifyOnReply(val) {
		if(typeof val !== 'boolean')
			throw new CustomError('Invalid value for notifyOnReply, must be type of boolean.')
		this._notifyOnReply = val
	}
	get entity() {
		return this._entity
	}
	set entity(val) {
		this._entity = Comment.entityNormalizer(val)
	}
	static entityVerifier(val) {
		if(!validator.isURL(val, {
			protocols: ['http','https','ftp'],
			require_tld: false,
			require_protocol: false,
			require_host: false,
			require_valid_protocol: false,
			allow_underscores: false,
			host_whitelist: false,
			host_blacklist: false,
			allow_trailing_dot: false,
			allow_protocol_relative_urls: false
		}))
			throw new CustomError({
				message: 'Invalid entity value, must be a URL.',
				status: 500
			})
		return val
	}
	static entityNormalizer(val) {
		const verified = Comment.entityVerifier(val)
		return verified.toLowerCase()
	}
	get parent() {
		return this._parent
	}
	set parent(val) {
		const temp = (val === undefined) ? undefined : Comment.parentNormalizer(val)
		if(temp && this.ancestors.length > 0 && !temp.equals(this.ancestors[this.ancestors.length -1 ]))
			throw new CustomError({
				message: 'Invalid parent value. Parent was not present on the end of the ancestor list.',
				status: 500
			})
		this._parent = temp
	}
	static parentVerifier(val) {
		if(!mongoUtil.isValidID(val, { allowNullable: true }))
			throw new CustomError({
				message: 'Invalid parent value, must be a mongo ID.',
			})
		return val
	}
	static parentNormalizer(val) {
		const verified = Comment.parentVerifier(val)
		return mongoUtil.normalizeID(verified, { allowNullable: true })
	}
	// Virtual Parent Comment
	get parentComment() {
		return (async () => {
			if(this.parent) {
				if(this._parentComment && this._parentComment._id === this.parent) {
					return this._parentComment
				}
				else {
					// Refresh/Search account (mismatch ID)
					const result = await mongoUtil.getDb()
						.collection(Comment.COLLECTION_NAME)
						.findOne({
							_id: this.parent
						})
					return Comment.fromJSON(result)
				}
			}
			else {
				return undefined
			}
		})()
	}
	get upVoteAccountIDs() {
		return this._upVoteAccountIDs
	}
	set upVoteAccountIDs(val) {
		this._upVoteAccountIDs = mongoUtil.normalizeArrayIDs(val)
	}
	get downVoteAccountIDs() {
		return this._downVoteAccountIDs
	}
	set downVoteAccountIDs(val) {
		this._downVoteAccountIDs = mongoUtil.normalizeArrayIDs(val)
	}
	get flags() {
		return this._flags
	}
	set flags(val) {
		this._flags = mongoUtil.normalizeArrayIDs(val)
	}
	get removed() {
		return this._removed
	}
	set removed(val) {
		this._removed = mongoUtil.normalizeID(val, { allowNullable: true })
	}
	get children() {
		return this._children
	}
	set children(val) {
		this._children = mongoUtil.normalizeArrayIDs(val)
	}
	get ancestors() {
		return this._ancestors
	}
	set ancestors(val) {
		const temp = mongoUtil.normalizeArrayIDs(val)
		if(this.parent && temp.length < 1)
			throw new CustomError({
				message: 'Invalid ancestors list. Ancestors is empty but parent is not.',
				status: 500
			})
		if(this.parent && !this.parent.equals(temp[temp.length - 1]))
			throw new CustomError({
				message: 'Invalid ancestors list. Ancestors last item is not equivalent to the parent.',
				status: 500
			})
		this._ancestors = temp
	}
	async toJSONIncludingVirtuals({ includeSensitiveFields=[] } = {}) {
		var obj = await super.toJSONIncludingVirtuals({ includeSensitiveFields: includeSensitiveFields })
		obj.accountID = this.accountID
		const account = await this.account
		if(account)
			obj.account = await account.toJSONIncludingVirtuals({ includeSensitiveFields: includeSensitiveFields.filter((field) => field.startsWith('account.')).map((field) => { return field.substr(8) }) })
		obj.text = this.text
		obj.textEditDate = this.textEditDate
		if(includeSensitiveFields.includes('email'))
			obj.email = this.email
		obj.nameFirst = this.nameFirst
		obj.nameLast = this.nameLast
		obj.notifyOnReply = this.notifyOnReply
		obj.entity = this.entity
		obj.parent = this.parent
		const parentComment = await this.parentComment
		if(parentComment)
			obj.parentComment = await parentComment.toJSONIncludingVirtuals({ includeSensitiveFields: includeSensitiveFields.filter((field) => field.startsWith('parentComment.')).map((field) => { return field.substr(8) }) })
		obj.upVoteAccountIDs = this.upVoteAccountIDs
		obj.downVoteAccountIDs = this.downVoteAccountIDs
		obj.flags = this.flags
		obj.removed = this.removed
		obj.children = this.children
		obj.ancestors = this.ancestors
		return obj
	}
	toJSON({ includeSensitiveFields=[] } = {}) {
		var obj = super.toJSON({ includeSensitiveFields: includeSensitiveFields })
		obj.accountID = this.accountID
		obj.text = this.text
		obj.textEditDate = this.textEditDate
		if(includeSensitiveFields.includes('email'))
			obj.email = this.email
		obj.nameFirst = this.nameFirst
		obj.nameLast = this.nameLast
		obj.notifyOnReply = this.notifyOnReply
		obj.entity = this.entity
		obj.parent = this.parent
		obj.upVoteAccountIDs = this.upVoteAccountIDs
		obj.downVoteAccountIDs = this.downVoteAccountIDs
		obj.flags = this.flags
		obj.removed = this.removed
		obj.children = this.children
		obj.ancestors = this.ancestors
		return obj
	}
}