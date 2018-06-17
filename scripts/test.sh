#!/bin/bash
set -e
set -o pipefail

docker run \
--rm \
--interactive \
--tty \
--env NODE_ENV=development \
--publish 3000:3000 \
--publish 9229:9229 \
--volume ${PWD}/:/home/node/app/ \
--workdir /home/node/app/ \
node:${BASE_IMAGE_TAG} \
npm test