#!/bin/sh
openssl aes-256-cbc -K $encrypted_82bd95a7f607_key -iv $encrypted_82bd95a7f607_iv -in id_rsa.enc -out id_rsa -d
chmod 600 id_rsa
eval "$(ssh-agent -s)"
ssh-add id_rsa
rm -f id_rsa
openssl aes-256-cbc -K $encrypted_82bd95a7f607_key -iv $encrypted_82bd95a7f607_iv -in configs-prod.json.enc -out configs-prod.json -d