import { ChainFactory, ChainType, Chain } from '@open-rights-exchange/chainjs'
import { ChainEndpoint } from '@open-rights-exchange/chainjs/src/models/'
import { ApiEndpoint, AppAccessTokenMetadata, AuthProvider, ChainNetwork, OreId, RequestType, TransactionSignOptions, UserSourceData, AccountName,  SignWithOreIdResult, JSONObject, generateHmac, generateHmacWithApiKeyOrProxyServer} from 'oreid-js'
import * as dotenv from 'dotenv';

import { Transaction } from '@open-rights-exchange/chainjs';
import { logHandler } from "./utils/logHandler";
import { errorHandler } from "./utils/errorHandler"
import { toEosEntityName, toEosAsset, toEosSymbol } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'
import { oreIdOptions } from './utils/oreid'
import { TransactionOptions } from '@open-rights-exchange/chainjs/dist/models'
import { EosActionStruct } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { ApiSignTransactionParams, callApiGetUser } from 'oreid-js/dist/api'
import { ApiGetUserParams } from 'oreid-js/dist/api'
import { callApiGetAppToken, callApiSignTransaction} from 'oreid-js/dist/api'
import { ApiGetAppTokenParams } from 'oreid-js/dist/api'
import OreIdContext from 'oreid-js/dist/core/IOreidContext'
import { createOreConnection } from './utils/chains';
import { TransactionData } from 'oreid-js'
import { createState } from './utils/stateTools';
import base64url from 'base64url';

import { bitArrayToBase64String } from '@open-rights-exchange/chainjs/dist/crypto/genericCryptoHelpers';
import { toRawTransactionFromSignResults } from '@open-rights-exchange/chainjs/dist/chains/algorand_1/helpers';
import { prepareMessageToSign } from '@open-rights-exchange/chainjs/dist/chains/ethereum_1';

async function createSendTransaction(fromUser: string, toUser: string, amount: string) {
    dotenv.config();
    // const oreidWebPopUp = new OreidWebPopUp(oreid)

    const appId =  process.env.OREID_APP_ID || ''
    const apiKey =  process.env.OREID_API_KEY || ''

    // let transaction: Transaction | undefined = undefined

    let oreId2: OreId = new OreId(oreIdOptions)
    // const params = { account: fromUser }
    // const botUser = await callApiGetUser(oreId2, params )
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
    
    // oreId2.accessToken = appAccessToken

    // let newChain = await createOreConnection()
    // let transaction2 = await newChain?.new.Transaction()
    // transaction2?.sign()
    // let user: UserSourceData | undefined = await callApiGetUser(oreId2, {account: toEosEntityName(fromUser)})
    // const oreAccount = oreId2.auth.user.data.chainAccounts.find(ca => ca.chainNetwork === "ore_main")
    // let userInfo = await oreId2.callOreIdApi(RequestType.Get, ApiEndpoint.GetUser, {"account": fromUser} )
    // logHandler.info(JSON.stringify(userInfo))
    // await userInfo.getData()
    // if (oreAccount) {
    const transferTransaction: EosActionStruct = {
        account: toEosEntityName('eosio.token'),
        name: 'transfer',
        authorization: [
            {
                actor: toEosEntityName(fromUser),
                permission: toEosEntityName('active'),
            },
        ],
        data: { 
            from: toEosEntityName(fromUser),
            to: toEosEntityName(toUser),
            quantity:  toEosAsset(String(amount), toEosSymbol("ORE"), 4),
            memo: "Transfer"
        }
    }

    const authorization_object = {
        threshold: 1,
        accounts: [{
            permission: {
                actor: toEosEntityName(fromUser),
                permission: toEosEntityName('active')
            },
            weight: 1
        }],
        keys: [{
            key: 'EOS725RKpd7EPM8NYtEV9qNqi7Fpgc5eZgYM5Muqj4oKSSAyXNbFH',
            weight: 1
        }],
        waits: []
    };

    const updateauth_input = {
        account: toEosEntityName(fromUser),
        permission: "ore_bot",
        parent: toEosEntityName("owner"),
        auth: authorization_object
    };

    const optIntoOreTransfers: EosActionStruct = {
        account: toEosEntityName('eosio'),
        name: "updateauth",
        authorization: [
            {
                actor: toEosEntityName(fromUser),
                permission: toEosEntityName("active")
            }
        ],
        // data: Buffer.from(JSON.stringify(updateauth_input), "utf8").toString('hex')
        data: updateauth_input
    };


    

    // const transferTransactionJSON =
    const signOptions: TransactionSignOptions = {
        provider: AuthProvider.OreId, // wallet type (e.g. 'algosigner' or 'oreid')
        broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
        state: "abc", // anything you'd like to remember after the callback
        returnSignedTransaction: false,
        callbackUrl: process.env.OREID_SIGN_CALLBACK_URL,
        preventAutosign: false, // prevent auto sign even if transaction is auto signable
    }

    const transactionData: TransactionData =  {
        // account: toEosEntityName('eosio.token'),
        chainAccount: toEosEntityName(fromUser),
        chainNetwork: ChainNetwork.OreTest,
        transaction: transferTransaction,
        signOptions: signOptions
    }

    const apiSignOptions: ApiSignTransactionParams = {
        autoSign: true,
        transactionData: transactionData
    }

    let oreConnection = await createOreConnection()
    if (oreConnection) {
        let transaction = await oreConnection.new.Transaction()
        if (transaction) {
            // await transaction.addAction(optIntoOreTransfers)

            await transaction.setTransaction([optIntoOreTransfers])
            const transactionJson3 = transaction.toJson()
            await transaction.prepareToBeSigned()
            await transaction.validate()
            const transactionRaw = await transaction.raw
            const transactionJson = transaction.toJson()
            logHandler.info(JSON.stringify(transactionJson3))
            const transactionJsontoBAse64 = Buffer.from(JSON.stringify(transactionJson)).toString("base64")
            // const transactionJsontoBAse64 = btoa(JSON.stringify(transactionJson))

            logHandler.info('transactionJsontoBase64: ' + transactionJsontoBAse64)
            // let rawTransaction = []
            // for (let tx in transactionRaw) {
            //     let tx1 = Number(transactionRaw[tx])
            //     rawTransaction.push(tx1.toString())
            // }
            // logHandler.info(JSON.stringify(rawTransaction))
            // let hexString: string = ''
            // for (let num of rawTransaction) {
            //     hexString = hexString + num
            // }
            // logHandler.info("hexString: " + hexString)

            // const base64String = Buffer.from(transactionRaw, 'utf8').toString('base64')
            // logHandler.info('base64string: ' + base64String)



            const date: Date = new Date
            const state: string = createState(date)
            const stateBase64 = Buffer.from(state, 'utf8').toString('base64')
            const stateBase64url = base64url.fromBase64(stateBase64)
            

            // let base64Output = ''
            // for ( let txn in transactionRaw) {
            //     base64Output = base64Output + transactionRaw[txn]

            // }

            // let transaction2 = Buffer.from(transaction.raw, 'binary').toString('base64')
            // transaction2 = transaction.raw.toString('base64')

            // let oreId2: OreId = new OreId(oreIdOptions)
            const params = { account: fromUser }
            const botUser: UserSourceData = await callApiGetUser(oreId2, params )
            logHandler.info('botUser: ' + botUser.accountName)
        
            let appAccessTokenMetadata: AppAccessTokenMetadata = {
                paramsNewAccount: undefined,
                newAccountPassword: "",
                currentAccountPassword: "",
                secrets: undefined
            }
            let accessTokenParams: ApiGetAppTokenParams = { appAccessTokenMetadata } 
            let appAccessToken = await callApiGetAppToken(oreId2, accessTokenParams)
            logHandler.info('appAccessToken: ' + appAccessToken)


            // const prepared: string = prepareMessageToSign(transaction.raw)
            // const newAccessToken = await oreId2.getAppAccessToken()
            // logHandler.info("newacessToken: " + newAccessToken)
            // localStorage.getItem()
            // oreId2.accessTokenHelper.setAccessToken(appAccessToken)
            // oreId2.accessToken = appAccessToken
            // const { user } = oreId2.auth
            // await user.getData()
            // console.log(user.accountName)
            // logHandler.info("preparedToSign: " + prepared)

        //    const base64Prepared = Buffer.from(prepared, 'utf8').toString('base64')
        //    logHandler.info(base64Prepared)
        //    const base64preparedurl = base64url.fromBase64(base64Prepared)

           // const hmac = generateHmac('2233', base64String)

           const hmacAppend = await generateHmacWithApiKeyOrProxyServer(false, apiKey, transactionJsontoBAse64)
           logHandler.info('hmac append: ' + hmacAppend)

            // await oreId2.getUser()

            // const bitArrayToBAse64 = bitArrayToBase64String(base64Output)
            // logHandler.info("bitArraytoBase64: "  + bitArrayToBAse64)
        
            let signBaseUrl = new URL("https://service.oreid.io/sign")
                signBaseUrl.searchParams.append("app_access_token", appAccessToken)
                signBaseUrl.searchParams.append("account", botUser.accountName)
                // signBaseUrl.searchParams.append("callback_url", 'http://34.102.183.104/sign')
                signBaseUrl.searchParams.append("callback_url", "https://callback.sampleapp.com")
                signBaseUrl.searchParams.append("chain_network", "ore_test")
                signBaseUrl.searchParams.append("chain_account",  botUser.accountName)
                signBaseUrl.searchParams.append("return_signed_transaction", "false")
                signBaseUrl.searchParams.append("allow_chain_account_selection", "false")
                signBaseUrl.searchParams.append("broadcast", "true")
                signBaseUrl.searchParams.append("provider", "google")
                signBaseUrl.searchParams.append("transaction", transactionJsontoBAse64)
                // signBaseUrl.searchParams.append("state", state)
                signBaseUrl.searchParams.append("transaction_chain_account", botUser.accountName)
                // signBaseUrl.searchParams.append("hmac", hmacAppend)
                // let signUrl = signBaseUrl.href + "&transaction=" + transactionJsontoBAse64
                const hmacUrl =  await oreId2.addAccessTokenAndHmacToUrl(signBaseUrl.href, appAccessTokenMetadata)

            const signTransaction: string = hmacUrl
            // const signTransaction: string = signBaseUrl.href
            // const signTransaction: string = signUrl 

            logHandler.info('sign address: ' + signTransaction)

            return signTransaction
        }
    }




        


        // await oreId3.auth.user.getData()
        // logHandler.info(oreId3.auth.user.data.chainAccounts)
        // let chain = await createOreConnection()
        // // if (chain) {
        // //     let transactionfromChain = await chain.new.Transaction(transactionData)
        // //     await transactionfromChain.prepareToBeSigned()
        // //     transaction = transactionfromChain
        // // }
        
        // await oreId3.auth.user.getData()
        // logHandler.info(JSON.stringify(oreId3.accessTokenHelper))
        // logHandler.info(oreId3.auth.accessToken)
        // let newAppToken = await callApiGetAppToken(oreId3, accessTokenParams)
        // logHandler.info("newAppToken: " + newAppToken)
        // oreId3.accessTokenHelper.setAccessToken(newAppToken)
        // await oreId3.auth.user.getData()
        // logHandler.info(oreId3.auth.user.data.accountName)

        // oreId3.accessTokenHelper.setAccessToken(newAppToken)

        // logHandler.info("")
        // let transaction: Transaction = await oreId3.createTransaction(transactionData)
        // logHandler.info('Transaction Url: '  + transaction.getSignUrl)

    // const transaction1 = await callApiSignTransaction(oreId3, apiSignOptions)
    // logHandler.info('transaction1: ' + transaction1)
    // let accountInfo: User = await oreId3.callOreIdApi(RequestType.Get, ApiEndpoint.GetUser, {"account": fromUser})
    // await accountInfo.getData()
    // logHandler.info('accountInfo: ' + JSON.stringify(accountInfo))
    // oreId3.auth.user.(...accountInfo)
    // let transaction = await oreId3.createTransaction(transactionData)
    // let transaction = oreId3.createTransaction(transactionData)
    // 
    //     logHandler.info(JSON.stringify(transactin.))
    // }
    
}

(async () => {
    try {
        const transaction = await createSendTransaction("ore1sbx3rf4j", "ore1sqvihyhs", "0.001" )
        if ( transaction ) {
            logHandler.info("Raw Transaction: " + transaction)
        }
    }
    catch (err) {
        logHandler.error('createSendTransaction', err)
    }
})()

// export async function initiateSign(
//     accountName: AccountName,
//     chainNetwork: ChainNetwork,
//     provider: AuthProvider,
//     transaction: JSONObject ): Promise< string > {
//     // 
//     // Returns a string with the url which signs the transaction in ORE-ID
//     // 
//     const oreId: OreId = new OreId(oreIdOptions)
//     let signUrl: string = ""

//     let signOptions = {
//         account: accountName,
//         chainNetwork: chainNetwork,
//         provider: provider,
//         transaction: transaction
//     }

//     try {
//         let transaction: Transaction = await oreId.createTransaction(signOptions)
//         logHandler.info("Transaction Object: ", transaction)
//         const signResponse: SignWithOreIdResult = await transaction.getSignUrl() || "Failure"
//         signUrl = signResponse.signUrl || "Failure"
//     }
//     catch (err) {
//         errorHandler("initiateSign failed: ", err)
//     }
//     return signUrl
// }

//https://service.oreid.io/sign#
    // ?app_access_token=2c43e04e-31f4-4a80-92dd-5e178613f1c1
    // &account=ore1sbx3rf4j
    // &callback_url=http%3A%2F%2Flocalhost%3A3000%2Fauthcallback
    // &chain_network=
    // &chain_account=
    // &broadcast=false
    // &return_signed_transaction=true
    // &allow_chain_account_selection=false
    // &provider=google
    // &transaction=ewogICJpZCI6ICJvbmUiCn0=
    // &state=bmV3c3RhdGU=
    // &hmac=be97a987312d343239f70d2a3e14ffc1ac500a3a2220002e3d2d6df90e925066

    // http://34.102.183.104/sign?state=553246736447566b58312f4c796d7051365848702b6d7576503042466d2b65637364372f596941632f4f6e37706d336a6c4d416f71356b616a41545537786b5a6678417a555a696d753154482b7365637532707179757147395539583044787a465a665278494a694a6d553d&error_code=callback_invalid&process_id=06ed60761f97

    // http://34.102.183.104/sign/?state=553246736447566b583138764e43706a422b6d4d487665424142496b723046695048462b692f594c6a4e48314835594a36776e30656c477858452f486e39414b5655734a644b76454549586647796c6f556471426651494a6f3758664c465a444b785538424773423376553d&error_code=callback_invalid&process_id=98234da4c72f

    // http://34.102.183.104/sign?state=553246736447566b5831396f49683759516e4f304f323856325439466e444b6571557038562f6d6f684b4b544834584d554b4a574a5a424b6975674737302b77413542684562376e586a50636e4663432f336b2b6f3575664d63686d502f507368356b3550544d436451413d&error_code=bad-param_transaction_must-be-base64-encoded&process_id=bf16b290511e

    // https://service.oreid.io/sign?app_access_token=dd3d6c3c-d16e-44f5-b123-c71655b84bc6&account=ore1sbx3rf4j&callback_url=http%3A%2F%2F34.102.183.104%2Fsign&chain_network=ore_test&chain_account=ore1sbx3rf4j&return_signed_transaction=true&allow_chain_account_selection=true&broadcast=true&provider=google&transaction=WhQ6Ym2XqjCvAAAQpoI0PqMFUABXLTzNzR8Mi6ox8c1KUAAKjtMjJA8Mi6ox8c1KWAm29uWxzUpaCGEAAAhPUkUAAB9UcmFuc2ZlciBmcm9tIE9SRSBDb21tdW5pdHkgQm90&state=553246736447566b58312b6d474468445a38784a756c42505244546968755041662b472b2f615434617a6e42787a484b566e3151316c5431567a6f794d6642594b464d747761354c6e596b545a4c7652622f4a315451316e775248727468526c664556782f4e4b314470593d&hmac=578fb721d2b79e531a0468d9aa8a88d4aea7eac5614796a64fbbedc5de403e3c
    
    // https://service.oreid.io/sign#?app_access_token=145b6483-a54b-4260-9d38-95f7e2c455fd&account=ore1sbx3rf4j&callback_url=https%3A%2F%2Fcallback.sampleapp.com&chain_network=&chain_account=&broadcast=true&return_signed_transaction=false&allow_chain_account_selection=false&transaction=ewogICJpZCI6ICJvbmUiCn0=&hmac=a5e1de69f8dd0743bfa823508f01e056f4935aa46f00b0e44469ce8eb63b357b

    // https://service.oreid.io/sign#?app_access_token=a30b06f6-ddad-4eb8-ab23-b7dd174457cd&account=ore1sbx3rf4j&callback_url=https%3A%2F%2Fcallback.sampleapp.com&chain_network=ore_test&chain_account=ore1sbx3rf4j&broadcast=true&return_signed_transaction=false&allow_chain_account_selection=false&provider=google&transaction=ewogICJhY2NvdW50IjogImVvc2lvLnRva2VuIiwKICAibmFtZSI6ICJ0cmFuc2ZlciIsCiAgImF1dGhvcml6YXRpb24iOiBbCiAgICB7CiAgICAgICJhY3RvciI6ICJvcmUxc2J4M3JmNGoiLAogICAgICAicGVybWlzc2lvbiI6ICJhY3RpdmUiCiAgICB9CiAgXSwKICAiZGF0YSI6IHsKICAgICJmcm9tIjogIm9yZTFzYngzcmY0aiIsCiAgICAidG8iOiAib3JlMXNxdmloeWhzIiwKICAgICJxdWFudGl0eSI6ICIwLjAwMTAwMDAwIE9SRSIsCiAgICAibWVtbyI6ICJUcmFuc2ZlciBmcm9tIE9SRSBDb21tdW5pdHkgQm90IgogIH0KfQ==&hmac=ffd737d10a1e88ccfde3dd46f526bbf000b261cec5fe6a3caeaef440721ea0ff

    // https://service.oreid.io/sign#?app_access_token=06a70266-c9ef-46e2-bb1b-5fd5674c6137&account=ore1sbx3rf4j&callback_url=https%3A%2F%2Fcallback.sampleapp.com&chain_network=eos_kylin&chain_account=&broadcast=true&return_signed_transaction=false&allow_chain_account_selection=false&provider=google&transaction=ewogICJhY2NvdW50IjogImVvc2lvLnRva2VuIiwKICAibmFtZSI6ICJ0cmFuc2ZlciIsCiAgImF1dGhvcml6YXRpb24iOiBbCiAgICB7CiAgICAgICJhY3RvciI6ICJvcmUxc2J4M3JmNGoiLAogICAgICAicGVybWlzc2lvbiI6ICJhY3RpdmUiCiAgICB9CiAgXSwKICAiZGF0YSI6IHsKICAgICJmcm9tIjogIm9yZTFzYngzcmY0aiIsCiAgICAidG8iOiAib3JlMXNxdmloeWhzIiwKICAgICJxdWFudGl0eSI6ICIwLjAwMTAwMDAwIE9SRSIsCiAgICAibWVtbyI6ICJUcmFuc2ZlciBmcm9tIE9SRSBDb21tdW5pdHkgQm90IgogIH0KfQ==&hmac=d79573bdc6f8e8f215b07a91e24f41d75d388002ac93f96bd1ae24c0b870ae2c