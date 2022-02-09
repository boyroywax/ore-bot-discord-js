# ore-bot-discord-js
Ore Community bot written in Typescript, leveraging the power of the ORE blockchain.

## Development Environment
* MacBook Pro (Intel Proc, 32GB Ram)
* Visual Studio Code Version 1.63.2
* NPX version 8.3.1
* TypeScript Verison 4.5.5
* Node Version 17.4
* Kubernetes GCloud instance
* Alpine 3.15 Container
* Docker Version 20.10.8

## Development Process
> https://dev.to/dariansampare/setting-up-docker-typescript-node-hot-reloading-code-changes-in-a-running-container-2b2f

Install typescript:
```shell
npm i typescript --save-dev
```

Initialize Typescript:
```shell
npx tsc --init
```

Edit following tsconfig.json lines:
```json
"baseUrl": "./src"
"target": "esnext"
"moduleResolution": "node"
"outdir": "./build"
```

Install dependencies:
```shell
npm install oreid-js
npm install discord.js @discordjs/rest @discordjs/builders discord-api-types
npm install @open-rights-exchange/chainjs
```

Bot adapted from:
> https://github.com/freeCodeCamp/100DaysOfCode-discord-bot

### Container Images for local and remote use
Docker images are supplied for an easy dev experience.  First, edit the .env file to meet your specifications. Use the suffixes -dev or -prod to distringuish your docker images:
```shell
docker build . -t username/ore-bot-discord-js-(dev/prod)
```

Run the local docker image.
```shell
docker run username/ore-bot-discord-js-(dev/prod)
```

Stop and delete local containers, images, and volumes.
```shell
# Get a list of all containers.
docker ps -a

# Stop all running containers.
docker stop $(docker ps -aq)

# Remove all containers.
docker rm $(docker ps -aq)

# Remove 'exited' containers.
docker rm $(docker ps --filter status=exited -q)

# Remove dangling images.
docker image prune

# Remove all images.
docker rmi $(docker images -q)

# Remove all volumes
docker volume rm --force $(docker volume ls -q)
```

## Add the bot to your guild/server
> https://discordjs.guide/preparations/adding-your-bot-to-servers.html
```text
https://discord.com/api/oauth2/authorize?client_id=123456789012345678&permissions=0&scope=bot%20applications.commands
```
