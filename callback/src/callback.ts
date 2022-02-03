import { Request, Response } from "express"
import express from 'express'
import * as dotenv from 'dotenv'
// import { logHandler } from "../../ore-bot-discord-js/src/utils/logHandler"

dotenv.config()
const app = express()
const port = 53134

app.get('/', (request: Request, response: Response) => {
	console.log('Returned User: ' + request.query.account)
	// response.sendFile('./index.html', { root: '.'  a})
	return response.redirect('https://discord.com/channels/936062852278665227/936064058942177301')
});

app.listen(port, '0.0.0.0', () => console.log(`App listening at http://localhost:${port}`));
