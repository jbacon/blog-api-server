# HELM CHART FOR PORTFOLIO

## INTRODUCTION
This chart bootstraps my portfolio web app on [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh).

## DEPLOY

### GKE (PROD)
```bash
helm template --name portfolioapi-joshbacon-name --namespace=default --values ./values-gke.yaml ./ | kubectl apply -f -
```

### LOAL (DEV)
```bash
helm template --name portfolioapi-joshbacon-name --namespace=default --values ./values-docker-for-desktop.yaml ./ | kubectl apply -f -
```
