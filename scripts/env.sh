#!/bin/bash -e -o pipefail



export BASE_IMAGE_TAG='9.7.1-alpine'
export DOCKER_HUB_USER='jbacon47'

if [ "$TRAVIS_PULL_REQUEST" = "false" ];
then
	export K8S_CA_CERT_PATH=${HOME}/ca.cert
	echo -n ${K8S_CA_CERT} | base64 -d > ${K8S_CA_CERT_PATH}
	export K8S_TOKEN=$(echo -n ${K8S_TOKEN} | base64 -d)
	export K8S_SERVER='https://35.227.175.60'
	export K8S_NAMESPACE='default'
	export K8S_VERSION='v1.10.2' #$(curl --silent --ssl --cacert ${K8S_CA_CERT_PATH} ${K8S_SERVER}'/version' | jq -r '.gitVersion' | cut -f1 -d"-")

	curl -LO https://storage.googleapis.com/kubernetes-release/release/${K8S_VERSION}/bin/linux/amd64/kubectl
	chmod +x ./kubectl
	sudo mv ./kubectl /usr/local/bin/kubectl

	curl  -sLo https://raw.githubusercontent.com/kubernetes/helm/master/scripts/get > ${HOME}/get_helm.sh
	chmod 700 ${HOME}/get_helm.sh
	source ${HOME}/get_helm.sh  --version 'v2.9.1'

	export MONGODB_ADMIN_USER=$(
	kubectl --server=${K8S_SERVER} --token=${K8S_TOKEN} --certificate-authority=${K8S_CA_CERT_PATH} --namespace=${K8S_NAMESPACE} \
	get secrets mongodb-auth-admin-credentials -o json \
	| jq -r '.data.user' \
	| base64 -d)

	export MONGODB_ADMIN_PASSWORD=$(
	kubectl --server=${K8S_SERVER} --token=${K8S_TOKEN} --certificate-authority=${K8S_CA_CERT_PATH} --namespace=${K8S_NAMESPACE} \
	get secrets mongodb-auth-admin-credentials -o json \
	| jq -r '.data.password' \
	| base64 -d)

	export PORTFOLIO_CONFIG_PASSWORD=$(
	kubectl --server=${K8S_SERVER} --token=${K8S_TOKEN} --certificate-authority=${K8S_CA_CERT_PATH} --namespace=${K8S_NAMESPACE} \
	get secrets portfolioapi-joshbacon-name -o json \
	| jq -r '.data."config-password"' \
	| base64 -d)

	export DOCKER_HUB_USER=$(
	kubectl --server=${K8S_SERVER} --token=${K8S_TOKEN} --certificate-authority=${K8S_CA_CERT_PATH} --namespace=${K8S_NAMESPACE} \
	get secrets docker-hub-credentials -o json \
	| jq -r '.data."user"' \
	| base64 -d)

	export DOCKER_HUB_PASSWORD=$(
	kubectl --server=${K8S_SERVER} --token=${K8S_TOKEN} --certificate-authority=${K8S_CA_CERT_PATH} --namespace=${K8S_NAMESPACE} \
	get secrets docker-hub-credentials -o json \
	| jq -r '.data."password"' \
	| base64 -d)
fi

