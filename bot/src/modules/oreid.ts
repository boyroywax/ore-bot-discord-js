import axios from "axios"
import { AccountName, AuthProvider, ChainAccount, ChainNetwork, LoginOptions, OreId, OreIdOptions ,SignOptions } from 'oreid-js'
import { Chain, HelpersEos } from '@open-rights-exchange/chainjs'

import { createOreConnection } from "./chains"
import { logHandler } from '../utils/logHandler'
import { errorHandler } from '../utils/errorHandler'
import { getOreIdUser } from "./mongo"


const oreIdOptions: OreIdOptions = {
    appName: process.env.OREID_APP_NAME || "Discord Bot",
    appId: process.env.OREID_APP_ID || '',
    apiKey: process.env.OREID_API_KEY || '',
    oreIdUrl: process.env.OREID_URL || "https://service.oreid.io",
    authCallbackUrl: process.env.OREID_AUTH_CALLBACK_URL,
    signCallbackUrl: process.env.OREID_SIGN_CALLBACK_URL
}

const oreId = new OreId(oreIdOptions)
logHandler.info("oreId: " + JSON.stringify(oreId))

export async function loginUser(authProvider: string, newState: string) {
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
    
        // Set the login options for the ORE-Test Network
        let loginOptions: LoginOptions = {
            provider: authProviderSet,
            chainNetwork: ChainNetwork.OreTest,
            state: newState
        }
        let loginResponse = await oreId.login(loginOptions)
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

export async function getUser(account: AccountName)  {
    // 
    // Accepts a user's ore-id ORE account name
    // Returns a User obj from ORE-ID APi
    // 
    let user
    try {
        logHandler.info("Fetching user: " + account + "...")
        const userInfo = await oreId.getUserInfoFromApi(account)
        // logHandler.info(account + " info: " + JSON.stringify(userInfo))
        user = userInfo
        logHandler.info("user object: " + user)
        return user
    }
    catch (err) {
        errorHandler("getUser failed: ", err)
    }

}

export async function getOreIdBalance(discordId: number): Promise<[string, number]> {
    // 
    // Returns a discord user's ORE-id account name and ORE Netowrk blockchain balance
    // 
    let oreIdUserName: string = "None"
    let oreIdBalance: number = 0.00
    try{
        // Find the user's Ore Networkk account in mongo
        oreIdUserName = await getOreIdUser(discordId)

        // Retrieve the user's object from OreID API
        const oreIdUserObj: any = await getUser(oreIdUserName)
        logHandler.info("oreIdUserObj: " + JSON.stringify(oreIdUserObj))

        // Coreate an Ore Network connection
        const oreConnection = await createOreConnection()
        const chainSymbol: string = "ORE"

        // Fetch the ORE-ID user's balance from the chain
        const balance = await oreConnection?.fetchBalance(oreIdUserObj.accountName, HelpersEos.toEosSymbol(chainSymbol))
        logHandler.info("user OREID balance: " + balance?.balance)
        oreIdBalance = Number(balance?.balance)
        
    } catch (err) {
        errorHandler('getOreIdBalance failed: ', err)
    }
    return [oreIdUserName, oreIdBalance]
}

export function logoutUserAddress(state: string): string {
    let logoutUrl: string = ""
    try {
        const logoutBaseUrl = new URL(process.env.OREID_URL + '/logout')
        logoutBaseUrl.searchParams.append("app_id", process.env.OREID_APP_ID || "")
        logoutBaseUrl.searchParams.append("providers", "all")
        logoutBaseUrl.searchParams.append("callback_url", process.env.OREID_LOGOUT_CALLBACK_URL || "")
        logoutBaseUrl.searchParams.append("state", state)

        logHandler.info("logoutUser address: ", logoutBaseUrl.href);
        logoutUrl = logoutBaseUrl.href
    } 
    catch (error) {
        errorHandler("logoutUser failed: ", error);
    }
    return logoutUrl
}

// export async function logoutUser(account?: AccountName){
//     logHandler.info("logging out user: " + account)
//     try {
//         const response = await axios.get(process.env.OREID_URL + '/logout', {
//             params: {
//                 app_id: process.env.OREID_APP_ID,
//                 providers: "all",
//                 callback_url: process.env.OREID_AUTH_CALLBACK_URL
//             }
//         })
//         logHandler.info("logoutUser response: ", response);
//     } 
//     catch (error) {
//         errorHandler("logoutUser failed: ", error);
//     }
// }

// async function loginWithIdToken() {
//     try {
//         let idToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjMzZmY1YWYxMmQ3NjY2YzU4Zjk5NTZlNjVlNDZjOWMwMmVmOGU3NDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyNzMwNTgwMzA4Ny1wNnZkMGw2OXZhajRhZDF0NmhxbDV2ZnM1ZzAxMjBmNC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjI3MzA1ODAzMDg3LXA2dmQwbDY5dmFqNGFkMXQ2aHFsNXZmczVnMDEyMGY0LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAxODA3MzE2MjgwMzcwNTQ0MzAwIiwiaGQiOiJhaWtvbi5jb20iLCJlbWFpbCI6ImphbWVzQGFpa29uLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoidlA2ODBKRlU2aHFxaFJETmJFclVIZyIsIm5hbWUiOiJKYW1lcyBEZXZsaW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2hlQ3ByLTBUSF9EWmZsWXRENThrSmJNamQyc3Y3d0JBZ1hPbzIxPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkphbWVzIiwiZmFtaWx5X25hbWUiOiJEZXZsaW4iLCJsb2NhbGUiOiJlbiIsImlhdCI6MTY0MjIxNjIyMCwiZXhwIjoxNjQyMjE5ODIwfQ.qAwwymqSBhNs66LhNlzZvt3moHaf7RtwZDuzHpTCdGErerbF6Y8BADQUb2v0dgCUiMhKj7IaFj_7khJ0B-5fr98HkfaJXHN-IjzhTJQaYubE1QRM2wCeEH0p05odbUvBFqfUyGW7CS3_FC__fTrhkZe9V8YcNPrfb2X3UBfG9XAU4UV2XI5tB1akiKoh06Lgo1530alziJfIi0DOEkLrB-nn1Hgh1UybUFrpiA-YCGch8gUeGhwmOcYQ-SK3jutZoqMbkmglSSirnSnSEmbebSh-5qQHZlvNcLIfNLTRh062wQMAAVVCeRfAIjwGYgVYFtoNsUn11DlEuLfLL6DHSg'
//         let userInfo = await oreId.login({idToken})
//         console.log(userInfo)
//     }
//     catch (error) {
//         console.error(error)
//     }
// }

async function initiateSign(accountName: string) {
    let signOptions: SignOptions = {
        account: accountName,
        chainNetwork: ChainNetwork.OreTest,
        provider: AuthProvider.Google,
        transaction: 'null' // String
    }
    try {
        let signResponse = await oreId.sign(signOptions)
        logHandler.info("signResponse: ", signResponse)
    }
    catch (err) {
        errorHandler("initiateSign failed: ", err)
    }
}
