#!/bin/bash
openssl aes-256-cbc -K $encrypted_82bd95a7f607_key -iv $encrypted_82bd95a7f607_iv -in id_rsa.enc -out id_rsa -d
chmod 600 id_rsa
eval "$(ssh-agent -s)"
ssh-add id_rsa
rm -f id_rsa
ssh portfolio@portfolioapi.joshbacon.name docker-compose -f /home/portfolio/api-server/docker-compose-prod.yaml down --remove-orphans
rsync -a --delete-after --exclude .git/ ${TRAVIS_BUILD_DIR}/ portfolio@portfolioapi.joshbacon.name:/home/portfolio/api-server/
ssh portfolio@portfolioapi.joshbacon.name docker-compose -f /home/portfolio/api-server/docker-compose-prod.yaml up -d --remove-orphans --force-recreate