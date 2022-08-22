###########
#  BASE   #
###########

FROM node:17.4-alpine3.15 as base

WORKDIR /home/app

COPY package*.json ./
COPY tsconfig.json ./

RUN yarn install

RUN yarn add global typescript --dev

COPY src/ src/

RUN yarn build

#################
#  TS-REMOVER   #
#################

FROM node:17.4-alpine3.15 as ts-remover

WORKDIR /usr/app

COPY --from=base /home/app/package*.json ./

RUN yarn install --only=production

COPY --from=base /home/app/build ./

###########
#  FINAL  #
###########

FROM node:17.4-alpine3.15

WORKDIR /usr/app

COPY --from=ts-remover /usr/app ./

COPY ./static ./

USER 1000

EXPOSE 53134

CMD ["node", "--trace-deprecation", "index.js"]




