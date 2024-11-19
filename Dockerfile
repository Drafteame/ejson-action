FROM node:22

LABEL "com.github.actions.icon"="blue"
LABEL "com.github.actions.color"="database"
LABEL "com.github.actions.name"="ejson action"
LABEL "com.github.actions.description"="Execute encryption and decryption of json files using ejson"
LABEL "org.opencontainers.image.source"="https://github.com/Drafteame/ejson-action"

RUN mkdir -p /opt/ejson/keys

COPY . /action
WORKDIR /action

RUN npm install --omit=dev

ENTRYPOINT ["node", "/action/index.js"]