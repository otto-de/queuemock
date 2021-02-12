FROM node:current-alpine

ADD *.js /dispatcher/
ADD *.json /dispatcher/
WORKDIR /dispatcher
RUN npm install

ENV AWS_ACCESS_KEY_ID=dummy
ENV AWS_SECRET_ACCESS_KEY=dummy
ENV AWS_DEFAULT_REGION=eu-central-1

ENTRYPOINT ["node", "/dispatcher/index.js"]
