var mongoUtil = require('../common/mongoUtil')
var Document = require('../model/document')
var Account = require('../model/accounts')
var validatorUtil = require('../common/validatorUtil')
var validator = require('validator')
var CustomError = require('../common/errorUtil')

module.exports = class Comment extends Document {
	static get COLLECTION_NAME() {
		return 'comments'
	}
	constructor(json) {
		// Set Default & Initials
		super(json)
		this.entity = json.entity
		this.children = json.children || []
		this.ancestors = json.ancestors || []
		this.parent = json.parent || undefined
		this._parentComment = (json.parentComment) ? Comment.fromJSON(json.parentComment) : null
		this.text = json.text
		this.textEditDate = json.textEditDate || null
		this.accountID = json.accountID || null
		this._account = (json.account) ? Account.fromJSON(json.account) : null
		this.email = json.email || null
		this.nameFirst = json.nameFirst || null
		this.nameLast = json.nameLast || null
		this.notifyOnReply = json.notifyOnReply
		this.upVoteAccountIDs = json.upVoteAccountIDs || []
		this.downVoteAccountIDs = json.downVoteAccountIDs || []
		this.flags = json.flags || []
		this.removed = json.removed || null
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
		this._accountID = validatorUtil.normalizeID(val, { allowNullable: true })
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
				return null
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
		this._textEditDate = validatorUtil.normalizeDate(val, { allowNullable: true })
	}
	get email() {
		return this._email
	}
	set email(val) {
		if(this.accountID && !validatorUtil.isValidNull(val)) {
			throw new CustomError({
				message: 'Invalid email. You cannot set email when accountID has already been set to a value.',
				status: 500
			})
		}
		if(validatorUtil.isValidNull(val))
			this._email = validatorUtil.normalizeNull(val)
		else
			this._email = validator.normalizeEmail(val)
	}
	get nameFirst() {
		return this._nameFirst
	}
	set nameFirst(val) {
		if(this.accountID) {
			if(!validatorUtil.isValidNull(val))
				throw new CustomError({
					message: 'Invalid nameFirst. Must be null because AccountID has already been set.',
					status: 500
				})
			this._nameFirst = validatorUtil.normalizeNull(val)
		}
		else {
			if(validatorUtil.isValidNull(val)) {
				throw new CustomError({
					message: 'Invalid nameFirst. Cannot be null.',
					status: 500
				})
			}
			else if(!validator.isAlpha(val)) {
				throw new CustomError({
					message: 'Invalid nameFirst. Only alphabetic characters allowed.',
					status: 500
				})
			}
			this._nameFirst = val
		}
	}
	get nameLast() {
		return this._nameLast
	}
	set nameLast(val) {
		if(this.accountID) {
			if(!validatorUtil.isValidNull(val))
				throw new CustomError({
					message: 'Invalid nameLast. Must be null because AccountID has already been set.',
					status: 500
				})
			this._nameLast = validatorUtil.normalizeNull(val)
		}
		else {
			if(validatorUtil.isValidNull(val)) {
				throw new CustomError({
					message: 'Invalid nameLast. Cannot be null.',
					status: 500
				})
			}
			else if(!validator.isAlpha(val)) {
				throw new CustomError({
					message: 'Invalid nameLast. Only alphabetic characters allowed.',
					status: 500
				})
			}
			this._nameLast = val
		}
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
		this._entity = validatorUtil.normalizeEntity(val, { allowNullable: true })
	}
	get parent() {
		return this._parent
	}
	set parent(val) {
		const temp = validatorUtil.normalizeID(val, { allowNullable: true })
		if(temp && this.ancestors.length > 0 && !temp.equals(this.ancestors[this.ancestors.length - 1]))
			throw new CustomError({
				message: 'Invalid parent value. Parent was not present on the end of the ancestor list.',
				status: 500
			})
		this._parent = temp
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
				return null
			}
		})()
	}
	get upVoteAccountIDs() {
		return this._upVoteAccountIDs
	}
	set upVoteAccountIDs(val) {
		this._upVoteAccountIDs = validatorUtil.normalizeArrayIDs(val)
	}
	get downVoteAccountIDs() {
		return this._downVoteAccountIDs
	}
	set downVoteAccountIDs(val) {
		this._downVoteAccountIDs = validatorUtil.normalizeArrayIDs(val)
	}
	get flags() {
		return this._flags
	}
	set flags(val) {
		this._flags = validatorUtil.normalizeArrayIDs(val)
	}
	get removed() {
		return this._removed
	}
	set removed(val) {
		this._removed = validatorUtil.normalizeID(val, { allowNullable: true })
	}
	get children() {
		return this._children
	}
	set children(val) {
		this._children = validatorUtil.normalizeArrayIDs(val)
	}
	get ancestors() {
		return this._ancestors
	}
	set ancestors(val) {
		const temp = validatorUtil.normalizeArrayIDs(val)
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