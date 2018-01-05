var mongodb = require('mongodb')
var CustomError = require('../common/errorUtil')
var configUtil = require('../common/configUtil')
var Account = require('../model/accounts')
var bcrypt = require('bcryptjs')
var mongoClient
var dbContext

exports.connect = async (url) => {
	if(mongoClient) throw new CustomError({ message: 'Already connected', status: 500 })
	mongoClient = await mongodb.MongoClient.connect(url)
}
exports.close = async () => {
	if(!mongoClient) throw new CustomError({ message: 'Already disconnected', status: 500 })
	await mongoClient.close()
	mongoClient = null
	return
}
exports.getDb = () => {
	if(!mongoClient) throw new CustomError({ message: 'Not connected.', status: 500 })
	return mongoClient.db('portfolio')
}
exports.configureDB = async () => {
	if(!mongoClient) throw new CustomError({ message: 'Not connected.', status: 500 })
	await exports.getDb().createCollection('accounts', { autoIndexId: true })
	await exports.getDb().ensureIndex('accounts', { email: 1 }, { unique: true })
	await exports.getDb().ensureIndex('accounts', { googleProfileID: 1 }, { unique: true, sparse: true })
	await exports.getDb().ensureIndex('accounts', { facebookProfileID: 1 }, { unique: true, sparse: true })
	// await exports.getDb().ensureIndex('accounts', { email: 1, nameFirst: 1, nameLast: 1 }, { })
	await exports.getDb().createCollection('comments', { autoIndexId: true })
	await exports.getDb().ensureIndex('comments', { accountID: 1  }, { })
	await exports.getDb().ensureIndex('comments', { entity: 1  }, { })
	await exports.getDb().ensureIndex('comments', { parent: 1  }, { })
	await exports.getDb().ensureIndex('comments', { ancestors: 1  }, { })
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
exports.validateID = function(val, { allowNullable=false }={}) {
	exports.normalizeID(val, { allowNullable: allowNullable })
	return val
}
/* return value or throw error if no convertable */
exports.normalizeID = function(val, { allowNullable=false }={}) {
	if(allowNullable && val === null)
		return null
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
	if(allowNullable && val === null)
		return null
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