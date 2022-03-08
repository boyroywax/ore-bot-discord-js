###########
#  BASE   #
###########

FROM node:16-alpine3.15 as base

WORKDIR /home/app

COPY package*.json ./

RUN npm i

RUN npm i -g typescript --save-dev

COPY tsconfig.json ./

COPY src/ src/

RUN npm run build

#################
#  TS-REMOVER   #
#################

FROM node:16-alpine3.15 as ts-remover

WORKDIR /usr/app

COPY --from=base /home/app/package*.json ./

RUN npm install --only=production

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


