const crypto = require('crypto')

exports.encrypt = function(password, textString) {
	const salt = new Buffer(crypto.randomBytes(16))
	const passwordDerivation = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')
	const iv = new Buffer(crypto.randomBytes(16))
	const cipher = crypto.createCipheriv('aes-256-cbc', passwordDerivation, iv)
	const encrypted = cipher.update(textString)
	const encryptedFinal = Buffer.concat([encrypted, cipher.final()])
	return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encryptedFinal.toString('hex')
}
exports.decrypt = function(password, encryptedHex) {
	const encryptedHexSplit = encryptedHex.split(':')
	const salt = new Buffer(encryptedHexSplit[0], 'hex')
	const passwordDerivation = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')
	const iv = new Buffer(encryptedHexSplit[1], 'hex')
	const encrypted = new Buffer(encryptedHexSplit[2], 'hex')
	const decipher = crypto.createDecipheriv('aes-256-cbc', passwordDerivation, iv)
	const decrypted = decipher.update(encrypted)
	const decryptedFinal = Buffer.concat([decrypted, decipher.final()])
	return decryptedFinal.toString()
}

/*
References:
- https://cafedev.org/article/2016/06/secure-text-encryption-with-nodejs/
*/