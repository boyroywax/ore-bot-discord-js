###########
#  DEV    #
###########

FROM node:16.14-alpine3.15 as base

WORKDIR /home/app

COPY package*.json ./
COPY tsconfig.json ./
COPY yarn.lock ./

RUN yarn install

RUN yarn global add typescript --dev
RUN yarn global add serve

COPY src/ src/
COPY ./public/ ./public/
COPY ./.env.development ./.env

RUN ["yarn", "build"]

EXPOSE 3000

CMD ["serve", "-s", "build"]