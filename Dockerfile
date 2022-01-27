###########
#  BASE   #
###########

FROM node:17.4-alpine3.15 as base

WORKDIR /home/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm i

RUN npm i -g typescript --save-dev

COPY src/ src/

RUN npm run build

#################
#  TS-REMOVER   #
#################

FROM node:17.4-alpine3.15 as ts-remover

WORKDIR /usr/app

COPY --from=base /home/app/package*.json ./

RUN npm install --only=production

COPY --from=base /home/app/build ./

###########
#  FINAL  #
###########

FROM node:17.4-alpine3.15

WORKDIR /usr/app

COPY --from=ts-remover /usr/app ./

USER 1000

CMD ["index.js"]

EXPOSE 4000


