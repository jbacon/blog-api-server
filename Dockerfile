# BASE
ARG BASE_IMAGE_TAG='9.7.1-alpine'

FROM node:${BASE_IMAGE_TAG} as base

USER node

ENV PORTFOLIO_HOME='/home/node/app'

COPY --chown=node:node ./ ${PORTFOLIO_HOME}/

WORKDIR ${PORTFOLIO_HOME}/

# DEV DEPENDENCIES
FROM base as dev_dependencies

ENV NODE_ENV='development'

RUN npm install

# LINTING
FROM dev_dependencies as lint

RUN npm run lint

# TESTING
FROM dev_dependencies as test

RUN npm test

# RELEASE
FROM base as release

ARG NODE_ENV='production'

ENV NODE_ENV=${NODE_ENV}

RUN npm install

CMD npm run ${NODE_ENV}