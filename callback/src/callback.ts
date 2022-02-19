import { Request, Response } from "express"
import express from 'express'
import { logHandler } from "./utils/logHandler"
import { verifyLogin, verifyLogout } from "./modules/mongo"


const app = express()
const port = Number(process.env.OREID_CALLBACK_PORT) || 53134
const redirectUrl = process.env.DISCORD_INVITE_URL || ''

app.get('/', (request: Request, response: Response) => {
	response.sendFile('./index.html', { root: '.' })
})

app.get('/auth', async (request: Request, response: Response) => {
	// console.log('Returned Request: ' + JSON.stringify(request))
	logHandler.info('Returned User: ' + request.query.account)
	logHandler.info('Return State: ' + request.query.state)
	let user: string = request.query.account?.toString() || ''
	let state: string = request.query.state?.toString() || ''
	const login = await verifyLogin(user, state).then(async function(loginSuccess) {
		logHandler.info("loginSuccess: " + loginSuccess)
		if (loginSuccess == true) {
			return response.sendFile('./login-success.html', { root: '.' })
		}
		else {
			return response.sendFile('./login-failure.html', { root: '.' })
		}
	})
})

app.get('/logout', async (request: Request, response: Response) => {
	// console.log('Returned Request: ' + JSON.stringify(request))
	logHandler.info('Returned User: ' + request.query.account)
	logHandler.info('Return State: ' + request.query.state)
	let user: string = request.query.account?.toString() || ''
	let state: string = request.query.state?.toString() || ''
	const logout = await verifyLogout(user, state).then(async function(logoutSuccess) {
		logHandler.info("logoutSuccess: " + logoutSuccess)
		if (logoutSuccess == true) {
			return response.sendFile('./logout-success.html', { root: '.' })
		}
		else {
			return response.sendFile('./logout-failure.html', { root: '.' })
		}
	})
})

app.get('/sign', (request: Request, response: Response) => {
	logHandler.info('Returned User: ' + request.query.account)
	// response.sendFile('./index.html', { root: '.'  a})
	return response.redirect(redirectUrl)
})

app.listen(port, '0.0.0.0', () => logHandler.info(`App listening at http://0.0.0.0:${port}`));
