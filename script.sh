#!/bin/bash

VERSION=$1

if curl --output /dev/null --silent --head --fail "https://github.com/Shopify/ejson/releases/download/v${VERSION}/ejson_${VERSION}_linux_amd64.tar.gz"; then
    DOWNLOAD_URL="https://github.com/Shopify/ejson/releases/download/v${VERSION}/ejson_${VERSION}_linux_amd64.tar.gz"
else
    VERSION=$(curl -s "https://api.github.com/repos/Shopify/ejson/releases/latest" | grep -oP '"tag_name": "\K(.*)(?=")' | sed 's/^v//')
    DOWNLOAD_URL="https://github.com/Shopify/ejson/releases/download/v${VERSION}/ejson_${VERSION}_linux_amd64.tar.gz"
fi

curl -sLo ejson.tar.gz $DOWNLOAD_URL
tar xfvz ejson.tar.gz
mv ejson /usr/local/bin/
chmod +x /usr/local/bin/ejson
rm ejson.tar.gz
echo "Ejson version: ${VERSION}"

mkdir -p /opt/ejson/keys