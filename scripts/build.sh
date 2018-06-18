#!/bin/bash
set -e

docker build \
--no-cache \
--file Dockerfile \
--tag ${DOCKER_HUB_USERNAME}/portfolio-api:latest \
${PWD}