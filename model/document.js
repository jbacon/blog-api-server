var validatorUtil = require('../common/validatorUtil')
var mongodb = require('mongodb')

module.exports = class Document {
	constructor(json) {
		// Use Set methods to perform validation
		// Set Default/Initial values
		this._id = json._id || new mongodb.ObjectID()
		this.dateUpdated = json.dateUpdated || new Date()
		this.dateCreated = json.dateCreated || new Date()
	}
	get _id() {
		return this.__id
	}
	set _id(val) {
		this.__id = validatorUtil.normalizeID(val)
	}
	get dateUpdated() {
		return this._dateUpdated
	}
	set dateUpdated(val) {
		this._dateUpdated = validatorUtil.normalizeDate(val)
	}
	get dateCreated() {
		return this._dateCreated
	}
	set dateCreated(val) {
		this._dateCreated = validatorUtil.normalizeDate(val)
	}
	/* This enforces use of get methods for creating Object.
		Otherwise "_" instance variables would be used.
		Object to be stored in Mongo. */
	toJSON() {
		var obj = {}
		obj._id = this._id
		obj.dateUpdated = this.dateUpdated
		obj.dateCreated = this.dateCreated
		return obj
	}
	async toJSONIncludingVirtuals() {
		var obj = {}
		obj._id = this._id
		obj.dateUpdated = this.dateUpdated
		obj.dateCreated = this.dateCreated
		return obj
	}
	static fromJSON(json) {
		return new this(json)
	}
}