import { Request, Response } from "express"
import express from 'express'
import { logHandler } from "./utils/logHandler"
import { verifyLogin, verifyLogout } from "./modules/mongo"
import { errorHandler } from "./utils/errorHandler"


const app = express()
const port = Number(process.env.OREID_CALLBACK_PORT) || 53134
const redirectUrl = process.env.DISCORD_INVITE_URL || ''

app.get('/', (request: Request, response: Response) => {
	// 
	// Default index response
	// 
	return response.sendFile('./index.html', { root: '.' })
})

app.get('/auth', async (request: Request, response: Response) => {
	//
	// Login authentication callback
	// 
	const user: string = request.query.account?.toString() || ''
	const state: string = request.query.state?.toString() || ''
	try {
		const login = await verifyLogin(user, state).then(async function(loginSuccess) {
			if ((loginSuccess == true) && (user != '')) {
				return response.sendFile('./login-success.html', { root: '.' })
			}
			else {
				return response.sendFile('./login-failure.html', { root: '.' })
			}
		})
	}
	catch (err) {
		errorHandler("Login authentification failed: ", err)
	}
})

app.get('/logout', async (request: Request, response: Response) => {
	// 
	// Logout authentification callback
	// 
	const state: string = request.query.state?.toString() || ''
	try {
		const logout = await verifyLogout(state).then(async function(logoutSuccess) {
			logHandler.info("logoutSuccess: " + logoutSuccess)
			if (logoutSuccess == true) {
				return response.sendFile('./logout-success.html', { root: '.' })
			}
			else {
				return response.sendFile('./logout-failure.html', { root: '.' })
			}
		})
	}
	catch (err) {
		errorHandler('Logout callback failed: ', err)
	}
})

app.get('/sign', (request: Request, response: Response) => {

	return response.redirect(redirectUrl)
})

app.listen(port, '0.0.0.0', () => logHandler.info(`App listening at http://0.0.0.0:${port}`));
