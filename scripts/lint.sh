#!/bin/bash
set -e

docker run \
--rm \
--interactive \
--tty \
--env NODE_ENV=development \
--volume ${PWD}/:/home/node/app/ \
--workdir /home/node/app/ \
node:9.7.1-alpine \
npm run lint