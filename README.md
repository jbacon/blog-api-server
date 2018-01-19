# Blog Website API Server:

My blog's public API server built with [NodeJs](https://nodejs.org/en/), [ExpressJS](https://expressjs.com/), & [MongoDB](https://www.mongodb.com/)
Handles Comments, Users, Authentication, Emails, & More.

[https://portfolioapi.joshbacon.name](https://portfolioapi.joshbacon.name)


## One-Liners to Remember:

### SSH Keys (w/ password)
```bash
ssh-keygen -t rsa -C ${MY_EMAIL} -b 4096 -N=${MY_PRIVATE_KEY_PASSWORD} -f ssh
```
### Encrypt / Decrypt w/ my [cryptoUtil](./common/cryptoUtil.js) library
```bash
MY_PLAIN_TEXT="hello world"
MY_PASSWORD=password123
MY_ENCRYPTED_TEXT=$(node -p 'let c=require("./common/cryptoUtil"); c.encrypt("'${MY_PASSWORD}'","'${MY_PLAIN_TEXT}'");')
MY_DECRYPTED_TEXT=$(node -p 'let c=require("./common/cryptoUtil"); c.decrypt("'${MY_PASSWORD}'","'${MY_ENCRYPTED_SECRET}'");')
```
- All secret configs stored in this git repo are first encrypted