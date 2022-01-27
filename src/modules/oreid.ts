// const {OreId} = require('oreid-js')
import { OreId, OreIdOptions, LoginOptions, AuthProvider, ChainNetwork, AccountName, SignOptions } from 'oreid-js'

const TEST_ACCOUNT = 'ore1sbx3rf4j'

const oreIdOptions: OreIdOptions = {
    appName: "My Sample App",
    appId: "t_fb2b26c75d5345b28228fba1ff45b6f7",
    apiKey: "t_k071111538d604776a0559a583287daf1",
    oreIdUrl: "https://service.oreid.io",
    authCallbackUrl: 'http://localhost:8000',
    signCallbackUrl: 'http://localhost:8000'
}

let oreId = new OreId(oreIdOptions)
console.log(oreId)


async function loginUser() {
    try {
        let authProvider = AuthProvider.Google
        console.log(authProvider)
        
        let loginOptions: LoginOptions = {
            provider: authProvider,
            chainNetwork: ChainNetwork.EosKylin
        }
        let loginResponse = await oreId.login(loginOptions)
        console.log(loginResponse)
    }
    catch (error) {
        console.error(error)
    }
    // window.location = loginResponse.loginUrl
}


async function getUser() {
    try {
        let account: AccountName = TEST_ACCOUNT
        console.log(account)
        let userInfo = await oreId.getUserInfoFromApi(account)
        console.log(userInfo)
    }
    catch (error) {
        console.error(error)     
    }
}

async function getUserFromLocal() {
    // let accessToken = oreId.accessToken
    // if(!accessToken) return
    let userInfo = await oreId.getUser()
    console.log(userInfo)
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

// async function checkCookie() {
//     let cookie = document.cookie
//     console.log(cookie)
// }

function run() {
    loginUser()
    // getUser()
    getUserFromLocal()
    initiateSign()
    // checkCookie()
    // loginWithIdToken()
}

export = run

