#!/bin/bash -e -o pipefail

docker build \
--no-cache \
--file Dockerfile \
--tag ${DOCKER_HUB_USER}/portfolio-api:latest \
${PWD}