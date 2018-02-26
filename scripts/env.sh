#!/bin/bash -e -o pipefail



export BASE_IMAGE_TAG='9.7.1-alpine'
export DOCKER_HUB_USER='jbacon47'

if [ "$TRAVIS_PULL_REQUEST" = "false" ];
then
	export K8S_TOKEN=$(echo -n ${K8S_TOKEN} | base64 -D)
	export K8S_CA_CERT=$(echo -n ${K8S_CA_CERT} | base64 -D)

	export K8S_CA_CERT_PATH=${HOME}/ca.cert
	echo -n "${K8S_CA_CERT}" > ${K8S_CA_CERT_PATH}
	export K8S_SERVER='https://35.227.175.60'
	export K8S_NAMESPACE='default'
	export K8S_VERSION=$(curl --silent --ssl --cacert ${K8S_CA_CERT_PATH} ${K8S_SERVER}'/version' | jq -r '.gitVersion' | cut -f1 -d"-")

	alias kubectl='kubectl --server=${K8S_SERVER} --token=${K8S_TOKEN} --certificate-authority=${K8S_CA_CERT_PATH} --namespace=${K8S_NAMESPACE}'

	export MONGODB_ADMIN_USER=$(
	kubectl get secrets mongodb-auth-admin-credentials -o json \
	| jq -r '.data.user' \
	| base64 -D)

	export MONGODB_ADMIN_PASSWORD=$(
	kubectl get secrets mongodb-auth-admin-credentials -o json \
	| jq -r '.data.password' \
	| base64 -D)

	export PORTFOLIO_CONFIG_PASSWORD=$(
	kubectl get secrets portfolioapi-joshbacon-name -o json \
	| jq -r '.data."config-password"' \
	| base64 -D)

	export DOCKER_HUB_USER=$(
	kubectl get secrets docker-hub-credentials -o json \
	| jq -r '.data."user"' \
	| base64 -D)

	export DOCKER_HUB_PASSWORD=$(
	kubectl get secrets docker-hub-credentials -o json \
	| jq -r '.data."password"' \
	| base64 -D)
fi

