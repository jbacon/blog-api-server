#!/bin/bash -e -o pipefail

docker login --username ${DOCKER_HUB_USER} --password ${DOCKER_HUB_PASSWORD}
docker push ${DOCKER_HUB_USER}/portfolio-api:latest