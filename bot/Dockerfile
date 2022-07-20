###########
#  BASE   #
###########

FROM node:16-alpine3.15 as base

WORKDIR /home/app

COPY package*.json ./

RUN yarn install

RUN yarn add global typescript --dev

COPY tsconfig.json ./

COPY src/ src/

RUN yarn build

#################
#  TS-REMOVER   #
#################

FROM node:16-alpine3.15 as ts-remover

WORKDIR /usr/app

COPY --from=base /home/app/package*.json ./

RUN yarn install --only=production

COPY --from=base /home/app/build ./

###########
#  FINAL  #
###########

FROM node:16-alpine3.15

WORKDIR /usr/app

COPY --from=ts-remover /usr/app ./
# COPY .env ./

USER 1000

CMD ["node", "--trace-deprecation", "index.js"]


