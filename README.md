[![Build Status](https://travis-ci.org/jbacon/blog-api-server.svg?branch=master)](https://travis-ci.org/jbacon/blog-api-server)

# Blog Website API Server:

Built via [NodeJs](https://nodejs.org/en/), [ExpressJS](https://expressjs.com/), [MongoDB](https://www.mongodb.com/)

[https://portfolioapi.joshbacon.name](https://portfolioapi.joshbacon.name)

## What Does the API Do?
- Comment System
- Accounts for Users
- Authentication
	- Email, Facebook, Google
- Authorization
	- Admin, Anonymous, Authenticated
- Alerts/Notifications/Emails
- Emails

## Helpful One-Liners:

### Encrypt/Decrypt via [cryptoUtil](./common/cryptoUtil.js) lib
```bash
MY_PLAIN_TEXT="hello world"
MY_PASSWORD=password123
MY_ENCRYPTED_TEXT=$(node -p 'let c=require("./common/cryptoUtil"); c.encrypt("'${MY_PASSWORD}'","'${MY_PLAIN_TEXT}'");')
MY_DECRYPTED_TEXT=$(node -p 'let c=require("./common/cryptoUtil"); c.decrypt("'${MY_PASSWORD}'","'${MY_ENCRYPTED_SECRET}'");')
```
- My configs files, [configs-local.json]() & [configs-prod.json](), contain only encrypted secrets, so they are safe to store in GitHub

### SSH Keys (w/ password)
```bash
ssh-keygen -t rsa -C ${MY_EMAIL} -b 4096 -N=${MY_PRIVATE_KEY_PASSWORD} -f ssh
```

### SSH Keys (w/o password)
```bash
ssh-keygen -t rsa -C ${MY_EMAIL} -b 4096 -f ssh
```