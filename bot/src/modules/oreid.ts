// import dotenv from 'dotenv'
import { OreId, OreIdOptions, LoginOptions, AuthProvider, ChainNetwork, AccountName, SignOptions } from 'oreid-js'
import { logHandler } from '../utils/logHandler'
import { createState } from '../utils/stateCall'

const TEST_ACCOUNT = 'ore1sbx3rf4j'
// dotenv.config()

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

export async function loginUser(authProvider: string) {
    let authProviderSet: AuthProvider = AuthProvider.Email
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
        
        const newState = createState()

        let loginOptions: LoginOptions = {
            provider: authProviderSet,
            chainNetwork: ChainNetwork.EosKylin,
            state: newState
        }
        let loginResponse = await oreId.login(loginOptions).then()
        logHandler.info(
            "LoginResponse: " + 
            JSON.stringify(loginResponse, null, 4)
        )
        return JSON.stringify(loginResponse, null, 4)
    }
    catch (error) {
        logHandler.error(error)
    }
}

export async function getUser(account: AccountName) {
    try {
        logHandler.info("Fetching user: " + account + "...")
        let userInfo = await oreId.getUserInfoFromApi(account)
        logHandler.info(account + " info:" + JSON.stringify(userInfo))
    }
    catch (error) {
        logHandler.error(error)     
    }
}

export async function logoutUser(account: AccountName){
    logHandler.info("logging out user")
}

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

async function initiateSign() {
    let accountName: AccountName = TEST_ACCOUNT
    let signOptions: SignOptions = {
        account: accountName,
        chainNetwork: ChainNetwork.EosKylin,
        provider: AuthProvider.Google,
        transaction: 'null' // String
    }
    try {
        let signResponse = await oreId.sign(signOptions)
        console.log(signResponse)
    }
    catch (error) {
        console.error(error)
    }
}
