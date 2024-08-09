FROM node:20

LABEL "com.github.actions.icon"="blue"
LABEL "com.github.actions.color"="database"
LABEL "com.github.actions.name"="ejson action"
LABEL "com.github.actions.description"="Execute encryption and decryption of json files using ejson"
LABEL "org.opencontainers.image.source"="https://github.com/Drafteame/ejson-action"

ENV VERSION=${VERSION}

RUN \
  if curl --output /dev/null --silent --head --fail "https://github.com/Shopify/ejson/releases/download/v${VERSION}/ejson_${VERSION}_linux_amd64.tar.gz"; then \
    DOWNLOAD_URL="https://github.com/Shopify/ejson/releases/download/v${VERSION}/ejson_${VERSION}_linux_amd64.tar.gz"; \
  else \
    VERSION=$(curl -s "https://api.github.com/repos/Shopify/ejson/releases/latest" | grep -oP '"tag_name": "\K(.*)(?=")' | sed 's/^v//'); \
    DOWNLOAD_URL="https://github.com/Shopify/ejson/releases/download/v${VERSION}/ejson_${VERSION}_linux_amd64.tar.gz"; \
  fi && \
  curl -sLo ejson.tar.gz $DOWNLOAD_URL && \
  tar xfvz ejson.tar.gz && \
  mv ejson /usr/local/bin/ && \
  chmod +x /usr/local/bin/ejson && \
  rm ejson.tar.gz && \
  echo "Version de ejson: ${VERSION}"

RUN mkdir -p /opt/ejson/keys

COPY . /action
WORKDIR /action

RUN npm install --omit=dev

ENTRYPOINT ["node", "/action/index.js"]