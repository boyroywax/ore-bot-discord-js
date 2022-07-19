import { HelpersEos } from '@open-rights-exchange/chainjs'
import { AccountName, AuthProvider, ChainNetwork,
        JSONObject,
        LoginOptions, OreId, OreIdOptions,
        SignWithOreIdResult, Transaction, UserSourceData } from 'oreid-js'
import User from 'oreid-js/dist/user/user'
import Auth from 'oreid-js/dist/auth/auth'
import { ApiGetUserParams, callApiGetUser } from 'oreid-js/dist/api'
import { TransactionSignOptions } from 'oreid-js'
// import * as dotenv from 'dotenv'

import { createOreConnection } from "./chains"
import { errorHandler } from '../utils/errorHandler'
import { logHandler } from '../utils/logHandler'
import { getOreIdUser } from "./mongo"
import { oreIdActions } from 'interfaces/OreChain'

// dotenv.config()


export const oreIdOptions: OreIdOptions = {
    appName: process.env.OREID_APP_NAME || "Discord Bot",
    appId: process.env.OREID_APP_ID || '',
    apiKey: process.env.OREID_API_KEY || '',
    oreIdUrl: process.env.OREID_URL || "https://service.oreid.io",
    authCallbackUrl: process.env.OREID_AUTH_CALLBACK_URL,
    signCallbackUrl: process.env.OREID_SIGN_CALLBACK_URL,
}

export async function loginUser(authProvider: string, newState: string) {
    // 
    // Returns a login url for an auth provider and passes the state
    // 
    let authProviderSet: AuthProvider = AuthProvider.Email
    const date: Date = new Date()
    switch (authProvider) {
        case "google":
            authProviderSet = AuthProvider.Google
            break
        case "facebook":
            authProviderSet = AuthProvider.Facebook
            break
        case "email":
            authProviderSet = AuthProvider.Email
            break
        case "sms":
            authProviderSet = AuthProvider.Phone
            break
        default:
            authProviderSet = AuthProvider.Email
            break
    }
    try {
        logHandler.info("authProvider: " + authProviderSet)

        let oreId: OreId = new OreId(oreIdOptions)
    
        // Set the login options for the ORE-Test Network
        let loginOptions: LoginOptions = {
            provider: authProviderSet,
            chainNetwork: ChainNetwork.OreTest,
            state: newState
        }
        let loginResponse = await oreId.auth.getLoginUrl(loginOptions)
        logHandler.info(
            "LoginResponse: " + 
            JSON.stringify(loginResponse, null, 4)
        )
        return JSON.stringify(loginResponse, null, 4)
    }
    catch (err) {
        errorHandler("loginUser failed: ", err)
    }
}

// async function loginWithIdToken(idToken: string) {
//     try {
//         let userInfo = await oreId.login({idToken})
//         console.log(userInfo)
//     }
//     catch (error) {
//         console.error(error)
//     }
// }

// export async function getUser(accountName: AccountName): Promise<UserSourceData | undefined>  {
//     // 
//     // Accepts a user's ore-id ORE account name
//     // Returns a User obj from ORE-ID APi
//     // 

//     // const appAccessToken: string = await oreId.getAppAccessToken()
//     let userApiInfo: UserSourceData | undefined = undefined
//     try {
//         logHandler.info("Fetching user: " + accountName + "...")
//         const oreId2 = await createOreConnection()
//         oreId2?.
//         logHandler.info("oreId: " + oreId)
//         const params: ApiGetUserParams = { "account": accountName }
//         // await oreId2.auth.user.callApi()
//         // const oreId3: OreId = new OreId(oreIdOptions)
//         userApiInfo = await callApiGetUser(oreId2., params)
//         logHandler.info("userApiInfo: " + userApiInfo)

//     }
//     catch (err) {
//         errorHandler("getUser", err)
//     }

//     return userApiInfo
// }

export async function getOreIdBalance(discordId: bigint): Promise<[string, number]> {
    // 
    // Returns a discord user's ORE-id account name and ORE Netowrk blockchain balance
    // 
    let oreIdUserName: string = "None"
    let oreIdBalance: number = 0.00
    try{
        // Find the user's Ore Networkk account in mongo
        oreIdUserName = await getOreIdUser(discordId)

        // Retrieve the user's object from OreID API
        // const oreIdUserObj: any = await getUser(oreIdUserName)
        // logHandler.info("oreIdUserObj: " + JSON.stringify(oreIdUserObj))

        // Coreate an Ore Network connection
        const oreConnection = await createOreConnection()
        const chainSymbol: string = "ORE"

        // Fetch the ORE-ID user's balance from the chain
        if (oreConnection) {
            const balance = await oreConnection.fetchBalance(HelpersEos.toEosEntityName(oreIdUserName), HelpersEos.toEosSymbol(chainSymbol))
            logHandler.info("user OREID balance: " + balance.balance)
            oreIdBalance = Number(balance.balance)
        }
        
    } catch (err) {
        errorHandler('getOreIdBalance failed: ', err)
    }
    return [oreIdUserName, oreIdBalance]
}

export function logoutUserAddress(state: string): string {
    // 
    // ** Not working to fully log out and enable new account selection on the next login **
    // Full logout from the ORE-ID Service 
    // 
    let logoutUrl: string = ""
    try {
        const logoutBaseUrl = new URL(process.env.OREID_URL + '/logout')
        logoutBaseUrl.searchParams.append("app_id", process.env.OREID_APP_ID || "")
        logoutBaseUrl.searchParams.append("providers", "all")
        logoutBaseUrl.searchParams.append("callback_url", process.env.OREID_LOGOUT_CALLBACK_URL || "")
        logoutBaseUrl.searchParams.append("state", state)
        
        // const logoutBaseUrl = new URL(process.env.OREID_URL + '/logout#app_id=' + process.env.OREID_APP_ID + '&providers=all&state=' + state +"&callback_url=" + process.env.OREID_LOGOUT_CALLBACK_URL)

        logHandler.info("logoutUser address: ", logoutBaseUrl.href);
        logoutUrl = logoutBaseUrl.href
    } 
    catch (error) {
        errorHandler("logoutUser failed: ", error);
    }
    return logoutUrl
}

export async function initiateSign(
    accountName: AccountName,
    chainNetwork: ChainNetwork,
    provider: AuthProvider,
    transaction: JSONObject ): Promise< string > {
    // 
    // Returns a string with the url which signs the transaction in ORE-ID
    // 
    let oreId: OreId = new OreId(oreIdOptions)
    let signUrl: string = ""

    let signOptions = {
        account: accountName,
        chainNetwork: chainNetwork,
        provider: provider,
        transaction: transaction
    }

    try {
        let transaction: Transaction = await oreId.createTransaction(signOptions)
        logHandler.info("Transaction Object: ", transaction)
        const signResponse: SignWithOreIdResult = await transaction.getSignUrl() || "Failure"
        signUrl = signResponse.signUrl || "Failure"
    }
    catch (err) {
        errorHandler("initiateSign failed: ", err)
    }
    return signUrl
}
