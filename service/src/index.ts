import express, { Request, Response } from "express"
import mongoose, { ConnectOptions } from "mongoose"

import { eventLogger, errorLogger, debugLogger } from "./utils/logHandler"
import { getPriceData } from "./actions/priceCheck"
import { verifyLogout } from "./actions/verifyLogout"
import { verifyLogin } from "./actions/verifyLogin"
import { loginError } from "./actions/loginError"
import { verifySign } from "./actions/verifySign"
import { checkOreIdLink } from "./actions/checkOreIdLink"
import { getActiveBalance } from "./actions/activeBalance"
import { getOreIdBalance } from "./actions/oreIdBalance"
import { DiscordUserReturn } from "./interfaces/DiscordUser"
import { getDiscordUserFromDiscordId, getDiscordUserFromOreId, getDiscordUserFromState } from "./actions/getUser"
import { listLastActivity } from "./actions/activityLog"
import { getTotalTips, listLastTips } from "./actions/getTips"
import { getChainAccount } from "./actions/getAccount"
import { mongoUri } from "./utils/mongo"
import { Proposals } from "./actions/makeProposal"
import { Proposal } from "./interfaces/VoterData"
import { UserVote } from "./actions/castVote"
import bodyParser from "body-parser"


const app = express()
const port: number = Number(process.env.OREID_CALLBACK_PORT) || 53134
const options: ConnectOptions = {autoIndex: true, autoCreate: true}

mongoose.connect(mongoUri, options)
	.then(result => app.listen(port, "0.0.0.0", () => console.log(`app running on port ${port}`)))
	.catch(err => console.log(err))

	//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
	// Health-check response
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
	// LoginError authentication callback
	// 
	const errorMsg: string = request.query.error?.toString() || ''
	const state: string = request.query.state?.toString() || ''
	try {
		await loginError(errorMsg, state).then((errorSuccess: boolean) => {
			if (errorSuccess === true) {
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
	const min: number = Number(request.query.min?.toString() || "0")
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

app.get('/api/account', async (request: Request, response: Response) => {
	// 
	// Verify if the transactions was signed
	// 
	const user: string = request.query.name?.toString() || ''

	try {
		const chainAccount = await getChainAccount(user)
		if (chainAccount) {
			return response.status(200).send(chainAccount)
		}
		else {
			return response.status(404).send({result: false})
		}
	}
	catch (err) {
		errorLogger('/api/account', err)
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
		// console.log(result)
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
	let resultData: DiscordUserReturn = ({} as DiscordUserReturn)

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
		return response.status(200).send(resultData)
	}
	catch (err) {
		errorLogger('/api/getUser', err)
		return response.status(404).send({"error": "Could not get user from DB"})
	}
})

app.post('/api/proposal', async (request: Request, response: Response) => {
	// 
	// Send the User's Active Balance 
	// 
	const action: string = request.body.action?.toString() || 'default'
	const caseNumber: number = Number(request.query.case?.toString())
	const data: {
		dateCreated: Date,
		caseNumber: number,
		title: string,
		creator: bigint | string,
		proposed: string,
		selections: string[],
		changeVote: boolean,
		endDate: Date,
		status: string,
		voteThreshold: number,
		voteMinimum: number
	} = request.body.data
	let resultData: Proposal = new Proposals({"caseNumber": caseNumber})

	try {
		switch (action){
			case "get": {
				await resultData.loadCase(caseNumber)
				resultData.creator = resultData.creator.toString()
				debugLogger("/api/proposal get result: " + JSON.stringify(resultData))
				break
			}
			case "update": {
				await resultData.loadCase(caseNumber)
				await resultData.updateCase(data)
				break
			}
			case 'new': {
				const proposal: Proposal = new Proposals({
					dateCreated: data.dateCreated,
                    caseNumber: data.caseNumber,
                    title: data.title,
                    creator: data.creator,
                    proposed: data.proposed,
                    selections: data.selections,
                    changeVote: data.changeVote,
                    endDate: data.endDate,
                    status: data.status,
                    voteThreshold: data.voteThreshold,
                    voteMinimum: data.voteMinimum
				})
				await proposal.saveCase()
				resultData = proposal
				debugLogger("/api/proposal new result: " + JSON.stringify(resultData))
				break
			}
			case "nextcase": {
				const nextCaseNum = await resultData.nextCaseNumber()
				return response.status(200).send({"nextcase": nextCaseNum})
			}
			case "vote": {
				await resultData.loadCase(caseNumber)
				const vote = new UserVote(data)
				const { savedVote } = await vote.save()
				await resultData.addVote(savedVote)
				break
			}
			case "delete": {
				const deleted: boolean = await resultData.deleteCase(caseNumber)
				if (deleted) {
					return response.status(200).send(deleted)
				}
				else {
					return response.status(404).send(deleted)
				}
			}
		}
		return response.status(200).send(resultData)
	}
	catch (err) {
		errorLogger('/api/proposal', err)
		return response.status(404).send(err)
	}
})



// app.listen(port, '0.0.0.0', () => debugLogger(`App listening at http://0.0.0.0:${port}`));
