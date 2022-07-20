###########
#  DEV    #
###########

FROM node:16.14-alpine3.15 as base

WORKDIR /home/app

COPY package*.json ./
COPY tsconfig.json ./
COPY yarn.lock ./

RUN yarn install

RUN yarn add global typescript --dev
RUN yarn add global serve

COPY src/ src/
COPY ./public/ ./public/
COPY ./.env.development ./

# RUN ["yarn", "build"]

EXPOSE 3000

CMD ["yarn", "dev"]
# CMD ["serve", "-s", "build"]