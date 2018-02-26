#!/bin/bash -e -o pipefail

helm template \
--kube-version ${K8S_VERSION} \
--namespace=${K8S_NAMESPACE} \
--name portfolioapi-joshbacon-name \
--values=${PWD}/helm-chart/values-gke.yaml \
${PWD}/helm-chart/ \
| tee ${HOME}/portfolioapi-spec.yaml

kubectl apply -f ${HOME}/portfolioapi-spec.yaml