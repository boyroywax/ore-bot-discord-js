import express, { Request, Response } from "express"

import { eventLogger, errorLogger, debugLogger } from "./utils/logHandler"
import { getPriceData } from "./actions/priceCheck"
import { verifyLogout } from "./actions/verifyLogout"
import { verifyLogin } from "./actions/verifyLogin"
import { loginError } from "./actions/loginError"
import { verifySign } from "./actions/verifySign"


const app = express()
const port: number = Number(process.env.OREID_CALLBACK_PORT) || 53134
const redirectUrl: string = process.env.DISCORD_INVITE_URL || ''

app.get('/', (request: Request, response: Response) => {
	// 
	// Default index response
	// 
	eventLogger({
		message: "/ hit",
		request: request
	})
	return response.status(200).send({status: "ready"})
})

app.get('/health-check', (request: Request, response: Response) => {
	// 
	// Default index response
	// 
	eventLogger({
		message: "/health-check hit",
		request: request
	})
	return response.status(200).send({status: "ready"})
})

app.get('/liveness-check', (request: Request, response: Response) => {
	// 
	// Default index response
	// 
	eventLogger({
		message: "/liveness-check hit",
		request: request
	})
	return response.status(200).send({status: "up"})
})

app.get('/api/', (request: Request, response: Response) => {
	// 
	// Default index response
	// 
	eventLogger({
		message: "/api hit",
		request: request
	})
	return response.status(200).send({status: "ready"})
})

app.get('/api/login', async (request: Request, response: Response) => {
	//
	// Login authentication callback
	// 
	const user: string = request.query.account?.toString() || ''
	const state: string = request.query.state?.toString() || ''
	try {
		await verifyLogin(user, state).then(async function(loginSuccess: boolean) {
			if ((loginSuccess == true) && (user != '')) {
				return response.status(200).send({result: true})
			}
			else {
				return response.status(404).send({result: false})
			}
		})
	}
	catch (err) {
		errorLogger("/api/login", err)
		return response.status(404).send({result: false})
	}
})
app.get('/api/loginError', async (request: Request, response: Response) => {
	//
	// Login authentication callback
	// 
	const errorMsg: string = request.query.error?.toString() || ''
	const state: string = request.query.state?.toString() || ''
	try {
		await loginError(errorMsg, state).then(async function(errorSuccess: boolean) {
			if ((errorSuccess == true)) {
				return response.status(200).send({result: true})
			}
			else {
				return response.status(404).send({result: false})
			}
		})
	}
	catch (err) {
		errorLogger("/api/loginError", err)
		return response.status(404).send({result: false})
	}
})

app.get('/api/logout', async (request: Request, response: Response) => {
	// 
	// Logout authentification callback
	// 
	eventLogger({
		message: "/logout Hit",
		request: request
	})
	const state: string = request.query.state?.toString() || ''
	console.log('state: ' + state)
	try {
		await verifyLogout(state).then(async function(logoutSuccess) {
			debugLogger("logoutSuccess: " + logoutSuccess)
			if (logoutSuccess == true) {
				return response.status(200).send({result: true})
			}
			else {
				return response.status(404).send({result: false})
			}
		})
	}
	catch (err) {
		errorLogger("/api/logout", err)
		return response.status(404).send({result: false})
	}

})

app.get('/api/sign', async (request: Request, response: Response) => {
	// 
	// Verify if the transactions was signed
	// 
	const user: string = request.query.account?.toString() || ''
	const state: string = request.query.state?.toString() || ''

	try {
		const signed = await verifySign(user, state)
		if (signed) {
			return response.status(200).send({result: true})
		}
		else {
			return response.status(404).send({result: false})
		}
	}
	catch (err) {
		errorLogger('/api/sign', err)
		return response.status(404).send({result: false})
	}

})

app.get('/api/priceOre', async( request: Request, response: Response ) => {
	let price: {} = {}
	try{
		price = await getPriceData("coingecko")
	}
	catch (err) {
		errorLogger('/api/priceOre', err)
		return response.status(404).send({error: "price not found" + err})
	}
	eventLogger({
		message: "/api/priceOre Hit",
		request: request
	})
	return response.status(200).send({"price": price})
})

app.listen(port, '0.0.0.0', () => debugLogger(`App listening at http://0.0.0.0:${port}`));
