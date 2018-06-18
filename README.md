[![Build Status](https://travis-ci.org/jbacon/blog-api-server.svg?branch=master)](https://travis-ci.org/jbacon/blog-api-server)

# My Blog's API Server: [https://portfolioapi.joshbacon.name](https://portfolioapi.joshbacon.name)

## Tech:
- [NodeJS](https://nodejs.org/en/)
- [ExpressJS](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Kubernetes](https://kubernetes.io/)
- [Helm](https://helm.sh/)
- [TravisCI](https://travis-ci.org/jbacon/blog-api-server)

## What Does it Do?
- Custom Comment System
- User Accounts
- User Authentication & Authorization
- Notifications

## Built-in Utilties:

### Crypto:
The lib: [cryptoUtil.js](./common/utils/cryptoUtil.js)
The script: [crypt.sh](./script/crypt.sh)
```bash
bash ./script/crypt.sh --help
```
- My configs files are encrypted, [configs-development.json](./configs-development.json) & [configs-production.json](./configs-production.json), so I can version in Git
- Encrypt Configs ```bash scripts/crypt.sh --password "${TECH_HUB_PORTFOLIO_CONFIG_PASSWORD}" encrypt --text "$(cat configs-development.json | base64)" > configs-development.txt```
- Decrypt Configs ```bash scripts/crypt.sh --password "${TECH_HUB_PORTFOLIO_CONFIG_PASSWORD}" decrypt --text "$(cat configs-development.txt)" | base64 --decode > configs-development.json```