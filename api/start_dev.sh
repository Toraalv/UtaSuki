#!/bin/bash

source .env

export PORT=5900 # ごくっ
# paths to HTTPS/TLS/SSL certificates (for localhost, I use mkcert, see https://github.com/FiloSottile/mkcert)
export PRIVATE_KEY="cert/localhost-key.pem"
export CERTIFICATE="cert/localhost.pem"

nodemon api.js
