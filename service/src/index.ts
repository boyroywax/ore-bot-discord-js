import express, { Request, Response } from "express"

import { eventLogger, errorLogger, debugLogger } from "./utils/logHandler"
import { getPriceData } from "./actions/priceCheck"
import { verifyLogout } from "./actions/verifyLogout"
import { verifyLogin } from "./actions/verifyLogin"
import { loginError } from "./actions/loginError"
import { verifySign } from "./actions/verifySign"
import { checkOreIdLink } from "./actions/checkOreIdLink"
import { getActiveBalance } from "./actions/activeBalance"
import { getOreIdBalance } from "./actions/oreIdBalance"
import { DiscordUser } from "./interfaces/DiscordUser"
import { getDiscordUserFromDiscordId, getDiscordUserFromOreId, getDiscordUserFromState } from "./actions/getUser"
import { listLastActivity } from "./actions/activityLog"
import { getTotalTips, listLastTips } from "./actions/getTips"


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

app.get('/api/activity', async (request: Request, response: Response) => {
    // 
    // Returns a list of logEntries for a user
    // Sorted in descending date order
    // Leaves only unique values
    // 
	eventLogger({
		message: "/activity Hit",
		request: request
	})
	const user: bigint = BigInt( request.query.user?.toString() || '0')
	const min: number = Number(request.query.min?.toString() || "1")
	const limit: number = Number(request.query.limit?.toString() || "20")

	try {
		await listLastActivity( user, min, limit ).then(function(userLogEntries) {
			debugLogger("logs: " + userLogEntries)
			if (userLogEntries) {
				return response.status(200).send(userLogEntries)
			}
			else {
				return response.status(404).send({result: false})
			}
		})
	}
	catch (err) {
		errorLogger("/api/activity", err)
		return response.status(404).send({result: false})
	}

})

app.get('/api/tips', async (request: Request, response: Response) => {
    // 
    // Returns a list of logEntries for a user
    // Sorted in descending date order
    // Leaves only unique values
    // 
	eventLogger({
		message: "/tips Hit",
		request: request
	})
	const user: bigint = BigInt( request.query.user?.toString() || '0')
	const min: number = Number(request.query.min?.toString() || "1")
	const limit: number = Number(request.query.limit?.toString() || "20")
	const format: string = request.query.format?.toString() || "list"

	try {
		switch(format) {
			case "list": {
				await listLastTips( user, min, limit ).then(function(userLogEntries) {
					debugLogger("logs: " + userLogEntries)
					if (userLogEntries) {
						return response.status(200).send(userLogEntries)
					}
					else {
						return response.status(404).send({result: false})
					}
				})
			}
			case "total": {
				const totalTips = await getTotalTips( user )
				return response.status(200).send(totalTips)
			}
		}
		
	}
	catch (err) {
		errorLogger("/api/tips", err)
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

app.get('/api/balance', async (request: Request, response: Response) => {
	// 
	// Send the User's Active Balance 
	// 
	const balanceType: string = request.query.type?.toString() || 'default'
	const discordUser: string = request.query.user?.toString() || ''
	let result: {} = { "activeBalance": "None", "oreIdBalance": "None", "oreIdAccount": "None" }

	try {
		switch (balanceType){
			case "active": {
				const activeBalance = await getActiveBalance( BigInt(discordUser) )
				result = { "activeBalance": activeBalance, "oreIdBalance": "None", "oreIdAccount": "None" }
				break
			}
			case "oreid": {
				const oreIdResult = await getOreIdBalance( BigInt(discordUser) )
				result = { "activeBalance": "None", "oreIdBalance": oreIdResult.oreIdBalance, "oreIdAccount": oreIdResult.oreIdAccountName }
				break
			}
			default: {
				const activeBalance = await getActiveBalance( BigInt(discordUser) )
				const oreIdResult = await getOreIdBalance( BigInt(discordUser) )
				result = { "activeBalance": activeBalance, "oreIdBalance": oreIdResult.oreIdBalance, "oreIdAccount": oreIdResult.oreIdAccountName }
				break
			}
		}
		return response.status(200).send(result)
	}
	catch (err) {
		errorLogger('/api/balance', err)
		return response.status(404).send(result)
	}

})

app.get('/api/priceOre', async( request: Request, response: Response ) => {
	eventLogger({
		message: "/api/priceOre Hit",
		request: request
	})
	try{
		const price = await getPriceData("coingecko")
		return response.status(200).send({"price": price})
	}
	catch (err) {
		errorLogger('/api/priceOre', err)
		return response.status(404).send({error: "price not found" + err})
	}
})

app.get('/api/checkOreIdLink', async(request: Request, response: Response) => {
	eventLogger({
		message: "/api/checkOreIdLink Hit",
		request: request
	})
	const currentUserOreId: string = request.query.oreid?.toString() || ""
	const state: string = request.query.state?.toString() || ""
	try {
		const result = await checkOreIdLink(currentUserOreId, state)
		console.log(result)
		return response.status(200).send(result)
	}
	catch (err) {
		errorLogger('/api/checkOreIdLink', err)
		return response.status(404).send({error: "Could not verify account link request"})
	}
})

app.get('/api/getUser', async (request: Request, response: Response) => {
	// 
	// Send the User's Active Balance 
	// 
	const userType: string = request.query.type?.toString() || 'default'
	const user: string = request.query.user?.toString() || ''
	let resultData: DiscordUser = ({} as DiscordUser)
	let result: {} = {}

	try {
		switch (userType){
			case "oreid": {
				resultData = await getDiscordUserFromOreId( user )
				break
			}
			case "discordid": {
				resultData = await getDiscordUserFromDiscordId( BigInt(user) )
				break
			}
			case 'state': {
				resultData = await getDiscordUserFromState( user )
				break
			}
		}
		result = {
			discordId: resultData.discordId.toString(),
			loggedIn: resultData.loggedIn,
			lastLogin: resultData.lastLogin,
			dateCreated: resultData.dateCreated,
			oreId: resultData.oreId,
			state: resultData.state,
			pendingTransaction: resultData.pendingTransaction
		}
		return response.status(200).send(result)
	}
	catch (err) {
		errorLogger('/api/getUser', err)
		return response.status(404).send({"error": "Could not get user from DB"})
	}
})

app.listen(port, '0.0.0.0', () => debugLogger(`App listening at http://0.0.0.0:${port}`));
