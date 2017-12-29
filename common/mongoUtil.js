var mongodb = require('mongodb')
var CustomError = require('../common/errorUtil')
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
	await exports.getDb().createCollection('comments', { autoIndexId: true })
	await exports.getDb().ensureIndex('accounts', { email: 1 }, { unique: true })
	await exports.getDb().ensureIndex('accounts', { googleProfileID: 1 }, { unique: true })
	await exports.getDb().ensureIndex('accounts', { facebookProfileID: 1 }, { unique: true })
	await exports.getDb().ensureIndex('accounts', { email: 1, nameFirst: 1, nameLast: 1 }, { })
	await exports.getDb().ensureIndex('comments', { accountID: 1  }, { })
	await exports.getDb().ensureIndex('comments', { entity: 1  }, { })
	await exports.getDb().ensureIndex('comments', { parent: 1  }, { })
	await exports.getDb().ensureIndex('comments', { ancestors: 1  }, { })
}