import { AppAccessTokenMetadata, OreId, Transaction, TransactionData, UserSourceData, UserData } from "oreid-js";
import { ApiGetAppTokenParams, callApiGetAppToken, callApiGetUser } from "oreid-js/dist/api";
import OreIdContext from "oreid-js/dist/core/IOreidContext";
import { logHandler } from "./utils/logHandler";
import { composeOreTransactionNoChainJs } from "./utils/ore";
import { oreIdOptions } from "./utils/oreid";
import LocalState from "oreid-js/dist/utils/localState";
import { User } from "@sentry/node";


const oreChainType = 'ore_test'

export async function SignWithOreID(fromUser: string, toUser: string, amount: number ): Promise<Transaction>  {

	// let oreId = new OreId(oreIdOptions)
	const userData : UserData = {
		accountName: fromUser,
		email: 

	}

	const OreIdContext = {
		"oreId": OreId,
		"user": userData
		setUser: (user: User | undefined ) => void

	}

	let oreId2: OreId = new OreId(oreIdOptions)
    // const params = { account: fromUser }
    // const botUser: UserSourceData = await callApiGetUser(oreId2, params )
    // logHandler.info('botUser: ' + botUser.accountName)

    // let appAccessTokenMetadata: AppAccessTokenMetadata = {
    //     paramsNewAccount: undefined,
    //     newAccountPassword: "",
    //     currentAccountPassword: "",
    //     secrets: undefined
    // }
    // let accessTokenParams: ApiGetAppTokenParams = { appAccessTokenMetadata } 
    // let appAccessToken = await callApiGetAppToken(oreId2, accessTokenParams)
    // logHandler.info('appAccessToken: ' + appAccessToken)

	// const newAccessToken = await oreId2.getAppAccessToken()
	// logHandler.info("newacessToken: " + newAccessToken)
	// localStorage.getItem()
	// oreId2.accessTokenHelper.setAccessToken(appAccessToken)
	// oreId2.auth.accessToken = appAccessToken
	const { user } = oreId2.auth
	console.log(user.isLoggedIn)
	await user.getData()
	console.log(user.accountName)
	
	// const userData = await callApiGetUser(oreId, {account: toEosEntityName(fromUser)})


	// get first algorand (e.g. algo_test) account in user's wallet
	// const signingAccount = userData.chainAccounts.find(
	// 	(ca) => ca.chainNetwork === oreChainType
	// );

	// if (!signingAccount) {
	// 	setErrors(
	// 		`User doesnt have any accounts on ${oreChainType}`
	// 	);
	// 	return;
	// }

	// Compose transaction contents
	const transactionBody: TransactionData = await composeOreTransactionNoChainJs(
		fromUser,
		toUser,
		amount
	)

	console.log("transactionBody:", transactionBody);

	// * To sign a transaction we have two options!!!
	
	// * Or we can create the transaction manually (using oreId directly)
	
	const transaction = await oreId2.createTransaction(transactionBody)

	return transaction
}
