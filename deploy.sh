#!/bin/sh
ssh portfolio@portfolioapi.joshbacon.name docker-compose -f /home/portfolio/api-server/docker-compose-prod.yaml down --remove-orphans
rsync -r --delete-after --quiet --exclude .git/ ${TRAVIS_BUILD_DIR}/ portfolio@portfolioapi.joshbacon.name:/home/portfolio/api-server/
ssh portfolio@portfolioapi.joshbacon.name docker-compose -f /home/portfolio/api-server/docker-compose-prod.yaml up -d --remove-orphans --force-recreate