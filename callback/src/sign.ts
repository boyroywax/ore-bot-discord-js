import { AppAccessTokenMetadata, OreId, Transaction, TransactionData, UserSourceData, UserData, JSONObject, TransactionSignOptions, AuthProvider, ChainNetwork } from "oreid-js";
import { ApiGetAppTokenParams, callApiGetAppToken, callApiGetUser } from "oreid-js/dist/api";
import OreIdContext from "oreid-js/dist/core/IOreidContext";
import { logHandler } from "./utils/logHandler";
import { composeOreTransactionNoChainJs } from "./utils/ore";
import { oreIdOptions } from "./utils/oreid";
import LocalState from "oreid-js/dist/utils/localState";
import User from "oreid-js/dist/user/user";
import { Url, parse } from "url";


const oreChainType = 'ore_test'

export async function SignWithOreID(fromUser: string, toUser: string, amount: number ): Promise<Transaction>  {

	// let oreId = new OreId(oreIdOptions)
	const userData : UserData = {
		"accountName": fromUser,
		"email": '',
		"picture": new URL("https://imgsrc.com") ,
		"name": '',
		"chainAccounts": [],
		"username": fromUser,
	}

	const OreIdContext = {
		"oreId": OreId,
		"user": userData.accountName,
	};


	function composeTxTransfer(chainAccount: string, toAddress: string) {
		const transaction = {
			from: chainAccount,
			to: toAddress || '',
			amount: amount,
			type: "transfer",
		};
		return transaction;
	}


	let oreId2: OreId = new OreId(oreIdOptions)
    const params = { account: fromUser }
    const botUser: UserSourceData = await callApiGetUser(oreId2, params )
    logHandler.info('botUser: ' + botUser.accountName)

	let oreIdTransaction = composeTxTransfer(fromUser, toUser)

    let appAccessTokenMetadata: AppAccessTokenMetadata = {
        paramsNewAccount: undefined,
        newAccountPassword: "",
        currentAccountPassword: "",
        secrets: undefined
    }
    let accessTokenParams: ApiGetAppTokenParams = { appAccessTokenMetadata } 
    let appAccessToken = await callApiGetAppToken(oreId2, accessTokenParams)
    logHandler.info('appAccessToken: ' + appAccessToken)
    oreId2._localState.cachedaccessToken = appAccessToken
    oreId2._localState.cachedUser = botUser

	const oreIdUser: User = new User({oreIdContext: oreId2, getAccessToken: oreId2._localState.cachedaccessToken, getAccountName: botUser.accountName})
    console.log(oreIdUser)
    await oreIdUser.getData()
    console.log("getData: " + oreIdUser.accountName)

	let oreid3 = new OreId(oreIdOptions)

	  // const transferTransactionJSON =
	  const signOptions: TransactionSignOptions = {
        provider: AuthProvider.OreId, // wallet type (e.g. 'algosigner' or 'oreid')
        broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
        state: "abc", // anything you'd like to remember after the callback
        returnSignedTransaction: false,
        callbackUrl: process.env.OREID_SIGN_CALLBACK_URL,
        preventAutosign: false, // prevent auto sign even if transaction is auto signable
    }

	const transferTransaction = {
		account: 'eosio.token',
		name: 'transfer',
		authorization: [
			{
				actor: fromUser,
				permission: 'active'
			},
		],
		data: { 
			from: fromUser,
			to: toUser,
			quantity: String(amount) + " ORE",
			memo: "Transfer"
		}
	}

    const transactionData: TransactionData =  {
        // account: toEosEntityName('eosio.token'),
        chainAccount: fromUser,
        chainNetwork: ChainNetwork.OreTest,
        transaction: transferTransaction,
        signOptions: signOptions
    }

	const transactionObject: Transaction = new Transaction({oreIdContext: oreid3, user: oreIdUser, data: transactionData})

    // const transactionCreate = await oreId2.createTransaction(transactionData)
    logHandler.info(JSON.stringify(await transactionObject.getSignUrl()))
	const signUrlFull = (await transactionObject.getSignUrl()).signUrl || ''
	logHandler.info("signUrlFull" + signUrlFull)

    // let parsedSignUrl: URL = new URL(signUrlFull)
	// let url = parse(parsedSignUrl.href, true)
	// logHandler.info(url.search)

	
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
	// const transactionBody: TransactionData = await composeOreTransactionNoChainJs(
	// 	fromUser,
	// 	toUser,
	// 	amount
	// )

	// console.log("transactionBody:", transactionBody);

	// * To sign a transaction we have two options!!!
	
	// * Or we can create the transaction manually (using oreId directly)
	
	// const transaction = await oreId2.createTransaction(transactionBody)

	return transactionObject
}
