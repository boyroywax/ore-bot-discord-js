import express, { Request, Response } from "express"
// import { OreId, UserData } from "oreid-js";
// import { OreIdWebWidget } from "oreid-webwidget";

import { eventLogger, errorLogger, debugLogger } from "./utils/logHandler"
// import { verifyLogin, verifyLogout, verifySign } from "./utils/mongo"
import { getPriceData } from "./actions/priceCheck"
import { verifyLogout } from "./actions/verifyLogout"


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
	eventLogger({
		message: "Index hit",
		request: request
	})
	return response.sendFile('./index.html', { root: './' })
})

// app.get('/auth', async (request: Request, response: Response) => {
// 	//
// 	// Login authentication callback
// 	// 
// 	const user: string = request.query.account?.toString() || ''
// 	const state: string = request.query.state?.toString() || ''
// 	try {
// 		await verifyLogin(user, state).then(async function(loginSuccess: boolean) {
// 			if ((loginSuccess == true) && (user != '')) {
// 				return response.sendFile('./login-success.html', { root: '.' })
// 			}
// 			else {
// 				return response.sendFile('./login-failure.html', { root: '.' })
// 			}
// 		})
// 	}
// 	catch (err) {
// 		errorLogger("Login authentification failed: ", err)
// 	}
// })

app.get('/logout', async (request: Request, response: Response) => {
	// 
	// Logout authentification callback
	// 
	const state: string = request.query.state?.toString() || ''
	try {
		const logout = await verifyLogout(state).then(async function(logoutSuccess) {
			debugLogger("logoutSuccess: " + logoutSuccess)
			if (logoutSuccess == true) {
				return response.status(200).send(true)
			}
			else {
				return response.status(404).send(false)
			}
		})
	}
	catch (err) {
		errorLogger("/logout", err)
		return response.status(404).send(false)
	}
})

// app.get('/sign', async (request: Request, response: Response) => {
// 	// 
// 	// Transaction signing callback using the web-widget
// 	// 



// 	const user: string = request.query.account?.toString() || ''
// 	const state: string = request.query.state?.toString() || ''

// 	try {
// 		const signed = await verifySign(user, state)
// 		if (signed) {
// 			return response.sendFile('./sign-success.html', { root: '.' })
// 		}
// 		else {
// 			return response.sendFile('./sign-success.html', { root: '.' })
// 		}
// 	}
// 	catch (err) {
// 		errorLogger('/sign', err)
// 	}

// 	return response.redirect(redirectUrl)
// })

app.get('/priceOre', async( request: Request, response: Response ) => {
	let price: {} = {}
	try{
		price = await getPriceData("coingecko")
	}
	catch (err) {
		errorLogger('/priceOre', err)
		return response.status(404).send({error: "price not found"})
	}
	eventLogger({
		message: "/priceOre Hit",
		request: request
	})
	return response.status(200).send(JSON.stringify(price))
})

app.listen(port, '0.0.0.0', () => debugLogger(`App listening at http://0.0.0.0:${port}`));
