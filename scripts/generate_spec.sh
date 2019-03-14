#!/bin/bash
set -e

kubectl create secret generic portfolioapi-joshbacon-name \
--from-literal="config-password=${TECH_HUB_PORTFOLIO_CONFIG_PASSWORD}" \
--dry-run \
--output yaml
helm template \
--kube-version $(kubectl version --output json | jq -r '.serverVersion.gitVersion') \
--namespace='production' \
--name portfolioapi-joshbacon-name \
${PWD}/helm-chart/