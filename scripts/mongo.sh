#!/bin/bash -e -o pipefail

helm fetch \
--repo https://kubernetes-charts.storage.googleapis.com \
--untar \
--destination ${HOME}/ \
--version 3.4.1 \
mongodb-replicaset

helm template \
--kube-version ${K8S_VERSION} \
--name mongodb \
--namespace default \
--set image.tag=3.6 \
--set persistence.size=10Gi \
--set auth.enabled=true \
--set auth.existingKeySecret=mongodb-auth-key \
--set auth.existingAdminSecret=mongodb-auth-admin-credentials \
${HOME}/mongodb-replicaset \
| tee ${HOME}/mongodb-spec.yaml

rm -r ${HOME}/mongodb-replicaset/

kubectl apply -f ${HOME}/mongodb-spec.yaml

# kubectl expose pod mongodb-mongodb-replicaset-0 --port 27017 --protocol=TCP --name=mongodb-replicaset-0 || true
# kubectl expose pod mongodb-mongodb-replicaset-1 --port 27017 --protocol=TCP --name=mongodb-replicaset-1 || true
# kubectl expose pod mongodb-mongodb-replicaset-2 --port 27017 --protocol=TCP --name=mongodb-replicaset-2 || true


# kubectl exec -i -t mongodb-mongodb-replicaset-2 -- \
# mongo \
# mongodb://mongodb-mongodb-replicaset-0:27017,mongodb-mongodb-replicaset-1:27017,mongodb-mongodb-replicaset-2:27017/admin?replicaSet=rs0 \
# --username ${MONGODB_ADMIN_USER} \
# --password ${MONGODB_ADMIN_PASSWORD} \
# --eval "db.adminCommand('listDatabases')"
