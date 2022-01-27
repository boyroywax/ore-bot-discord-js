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

## Development Process
* https://dev.to/dariansampare/setting-up-docker-typescript-node-hot-reloading-code-changes-in-a-running-container-2b2f

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
npm install js-cookie
npm install discord.js @discordjs/rest discord-api-types
```
