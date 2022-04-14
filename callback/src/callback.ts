import { Request, Response } from "express"
import express from 'express'
// import { OreId, UserData } from "oreid-js";
// import { OreIdWebWidget } from "oreid-webwidget";

import { logHandler } from "./utils/logHandler"
import { verifyLogin, verifyLogout, verifySign } from "./utils/mongo"
import { errorHandler } from "./utils/errorHandler"
import { SignWithOreID } from "./sign"
import { OreId } from "oreid-js"
import { oreIdOptions } from "./utils/oreid"


const app = express()
// const appId: string = process.env.OREID_APP_ID || ''
// const apiKey: string = process.env.OREID_API_KEY || ''
const port: number = Number(process.env.OREID_CALLBACK_PORT) || 53134
const redirectUrl: string = process.env.DISCORD_INVITE_URL || ''

//Initialize the libraries
// let oreId = new OreId({ appId, apiKey })
// const webwidget = new OreIdWebWidget(oreId)

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

app.get('/sign', async (request: Request, response: Response) => {
	// 
	// Transaction signing callback using the web-widget
	// 
	const user: string = request.query.user?.toString() || ''
	const recipient: string = request.query.recipient?.toString() || ''
	const amount: string = request.query.amount?.toString() || '0.00'
	const state: string = request.query.state?.toString() || ''
	logHandler.info(user + " " + recipient + " " +  amount + " " + state)
	// const error_message: string = request.query.error_message?.toString() || ''

	try {
		const signed: boolean = await verifySign(user, state)
		logHandler.info("signed:" + signed)
		if (signed) {
			const oreId2 = new OreId(oreIdOptions)
			const userOreId = oreId2.auth.user
			await userOreId.getData()
			console.log(userOreId.accountName)
			const transaction = await SignWithOreID(userOreId.accountName, recipient, Number(amount))
			if (!transaction) {
				return response.sendFile('./sign-failure.html', { root: '.' })
			}
			else if (transaction) {
				return response.redirect(String(await transaction.getSignUrl()))
			}
		}
		
	}
	catch (err) {
		errorHandler('/sign', err)
	}

	return response.redirect(redirectUrl)
})

app.listen(port, '0.0.0.0', () => logHandler.info(`App listening at http://0.0.0.0:${port}`));
