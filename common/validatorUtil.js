var mongodb = require('mongodb')
var CustomError = require('../common/errorUtil')
var validator = require('validator')

exports.isValidNull = function(val) {
	try {
		exports.normalizeNull(val)
		return true
	}
	catch(err) {
		return false
	}
}
exports.normalizeNull = function(val) {
	if(val === undefined
		|| val === null
		|| val === ''
		|| val === ''
		|| val === 'null'
		|| val === 'undefined')
		return null
	throw new CustomError({
		message: 'Value ('+val+') can not be converted to null',
		status: 500
	})
}
exports.isBool = function(val) {
	if(typeof(val) === 'string') {
		if(val.toLowerCase() === 'true') return true
		if(val.toLowerCase() === 'false') return false
	}
	if(typeof(val) === 'boolean') return val
}
exports.normalizeBool = function(val) {
	if(typeof(val) === 'string') {
		if(val.toLowerCase() === 'true') return true
		if(val.toLowerCase() === 'false') return false
	}
	if(typeof(val) === 'boolean') return val
	throw new CustomError({
		messag: 'Value ('+val+') can not be converted to boolean',
		status: 500
	})
}
/* return bool (assumes normalized already) */
exports.isValidID = function(val, { allowNullable=false }={}) {
	try {
		exports.normalizeID(val, { allowNullable: allowNullable })
		return true
	}
	catch(err) {
		return false
	}
}
/* return value or throw error if no convertable */
exports.normalizeID = function(val, { allowNullable=false }={}) {
	if(allowNullable === true && exports.isValidNull(val))
		return exports.normalizeNull(val)
	else if(val instanceof mongodb.ObjectID)
		return val
	else if(mongodb.ObjectID.isValid(val))
		return mongodb.ObjectID(val)
	throw new CustomError({
		message: 'Value ('+val+') can not be converted to Mongo ObjectID',
		status: 500
	})
}
exports.isValidArrayIDs = function(val, { allowNullable=false }={}) {
	try {
		exports.normalizeArrayIDs(val, { allowNullable: allowNullable })
		return true
	}
	catch(err) {
		return false
	}
}
exports.normalizeArrayIDs = function(val, { allowNullable=false }={}) {
	if(allowNullable === true && exports.isValidNull(val))
		return exports.normalizeNull(val)
	else if(val instanceof Array) {
		return val.map((id) => {
			return exports.normalizeID(id)
		})
	}
	throw new CustomError({
		message: 'Value ('+val+') can not be converted to Mongo ObjectID',
		status: 500
	})
}
exports.isValidDate = function(val, { allowNullable=false }={}) {
	try {
		exports.normalizeDate(val, { allowNullable: allowNullable })
		return true
	}
	catch(err) {
		return false
	}
}
exports.normalizeDate = function(val, { allowNullable=false }={}) {
	if(allowNullable === true && exports.isValidNull(val))
		return exports.normalizeNull(val)
	return new Date(val)
}
exports.normalizeEntity = function(val, { allowNullable=false }={}) {
	if(allowNullable === true && exports.isValidNull(val))
		return exports.normalizeNull(val)
	if(validator.isURL(val, {
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
		return val
	throw new CustomError({
		message: 'Value ('+val+') can not be converted to Entity',
		status: 500
	})
}
//My custom comment entity id
exports.isValidEntity = function(val, { allowNullable=false }={}) {
	try {
		exports.noramalizeEntity(val, { allowNullable: allowNullable })
		return true
	}
	catch(err) {
		return false
	}
}