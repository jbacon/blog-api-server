const nodemailer = require('nodemailer')
var configUtil = require('../common/configUtil')
var validator = require('validator')
var CustomError = require('../common/errorUtil')
var logger = require('../common/loggingUtil').appLogger

exports.transporter = nodemailer.createTransport({
	// service: 'gmail',
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		type: 'OAuth2',
		user: configUtil.adminEmail,
		clientId: configUtil.googleAppID,
		clientSecret: configUtil.googleAppSecret,
		refreshToken: configUtil.googleGmailRefreshToken,
		accessToken: configUtil.googleGmailAccessToken,
		expires: Date.now() + (5 * 60 * 1000)
	}
})
exports.transporter.on('token', (/*token*/) => {
	logger.info('A new access token was generated for nodemailer transporter using the refresh token.')
})
exports.sendEmail = async function(email) {
	try {
		if(!(email instanceof exports.Email))
			throw new CustomError({
				message: 'Value: '+email+', is not instance of Email',
				status: 500
			})
		await (new Promise(function(resolve, reject) {
			exports.transporter.sendMail(email.toJSON(), (error/*, info*/) => {
				if (error)
					reject(error)
				else
					resolve()
			})
		}))
	}
	catch(e) {
		throw new CustomError({
			message: 'Failed sending Email',
			status: 500,
			err: e
		})
	}
}

exports.Email = class Email {
	static get COLLECTION_NAME() {
		return 'accounts'
	}
	constructor(email) {
		this.fromJSON(email)
	}
	get to() {
		return this._to
	}
	set to(val) {
		const emails = val.split(', ')
		var emailsNormalized = ''
		for(var i=0; i < emails.length; i++) {
			const emailNormalized = validator.normalizeEmail(emails[i])
			if(emailsNormalized) {
				emailsNormalized += emailNormalized
			}
			else {
				emailsNormalized += ', '+emailNormalized
			}
		}
		this._to = emailsNormalized
	}
	get from() {
		return this._from
	}
	set from(val) {
		this._from = val
		// this._from = validator.normalizeEmail(val)
	}
	get subject() {
		return this._subject
	}
	set subject(val) {
		this._subject = val
	}
	get text() {
		return this._text
	}
	set text(val) {
		this._text = val
	}
	get html() {
		return this._html
	}
	set html(val) {
		this._html = val
	}
	toJSON() {
		var obj = {}
		obj.to = this.to
		obj.from = this.from
		obj.subject = this.subject
		obj.text = this.text
		obj.html = this.html
		return obj
	}
	fromJSON(json){
		this.to = json.to
		this.from = json.from
		this.subject = json.subject
		this.text = json.text
		this.html = json.html
	}
}