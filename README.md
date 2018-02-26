[![Build Status](https://travis-ci.org/jbacon/blog-api-server.svg?branch=master)](https://travis-ci.org/jbacon/blog-api-server)

# Blog Website API Server: [https://portfolioapi.joshbacon.name](https://portfolioapi.joshbacon.name)

## Techincal Features:
- [NodeJS](https://nodejs.org/en/)
- [ExpressJS](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- Hosted on EC2.

## What Does the API Do?
- Comment System
- User Accounts
- User Authentication & Authorization
- Email Notifications

## Helpful One-Liners:

### Encrypt/Decrypt via [cryptoUtil](./common/utils/cryptoUtil.js) lib
```bash
MY_PLAIN_TEXT="hello world"
MY_PASSWORD=example_secret_password
MY_ENCRYPTED_TEXT=$(node -p 'let c=require("./common/utils/crypto.js"); c.encrypt("'${MY_PASSWORD}'","'${MY_PLAIN_TEXT}'");')
MY_DECRYPTED_TEXT=$(node -p 'let c=require("./common/utils/crypto.js"); c.decrypt("'${MY_PASSWORD}'","'${MY_ENCRYPTED_TEXT}'");')
```
- My configs files, [configs-local.json]() & [configs-prod.json](), contain only encrypted secrets, so they are safe to store in GitHub

### SSH Keys (w/o password)
```bash
ssh-keygen -t rsa -C ${MY_EMAIL} -b 4096 -f ssh
```