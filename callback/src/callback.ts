import { Request, Response } from "express"
import express from 'express'

const app = express()
const port = 53134
const redirectUrl = process.env.DISCORD_INVITE_URL || ''

app.get('/', (request: Request, response: Response) => {
	response.sendFile('./index.html', { root: '.' })
})

app.get('/auth', (request: Request, response: Response) => {
	// console.log('Returned Request: ' + JSON.stringify(request))
	console.log('Returned User: ' + request.query.account)
	// response.sendFile('./index.html', { root: '.'  a})
	return response.redirect(redirectUrl)
})

app.get('/sign', (request: Request, response: Response) => {
	console.log('Returned User: ' + request.query.account)
	// response.sendFile('./index.html', { root: '.'  a})
	return response.redirect(redirectUrl)
})

app.listen(port, '0.0.0.0', () => console.log(`App listening at http://0.0.0.0:${port}`));
