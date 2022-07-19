import { ChainFactory, ChainType, Chain } from '@open-rights-exchange/chainjs'
import { ChainEndpoint } from '@open-rights-exchange/chainjs/src/models/'
<<<<<<< HEAD
import { ApiEndpoint, AppAccessTokenMetadata, AuthProvider, ChainNetwork, OreId, RequestType, TransactionSignOptions, UserSourceData, AccountName,  SignWithOreIdResult, JSONObject, generateHmac, generateHmacWithApiKeyOrProxyServer, Transaction, WebWidgetAction} from 'oreid-js'
import * as dotenv from 'dotenv';

// import { Transaction } from '@open-rights-exchange/chainjs';
import { logHandler } from "./utils/logHandler";
=======
import { ApiEndpoint, AppAccessTokenMetadata, AuthProvider, ChainNetwork, OreId, RequestType, Transaction, TransactionSignOptions, UserSourceData, AccountName,  SignWithOreIdResult, JSONObject} from 'oreid-js'
import * as dotenv from 'dotenv';

import { logHandler } from "./utils/logHandler"
>>>>>>> parent of e464922 (why does this not work?)
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
<<<<<<< HEAD
import { TransactionData, WebWidgetSignResult, WebWidgetSignParams } from 'oreid-js'
import { createState } from './utils/stateTools';
import base64url from 'base64url';
import LocalState from 'oreid-js/dist/utils/localState';
import IStorage from 'oreid-js/dist/core/IStorage';
import User from 'oreid-js/dist/user/user';
import Auth from 'oreid-js/dist/auth/auth';
import AccessTokenHelper from 'oreid-js/dist/auth/accessTokenHelper';
import { prepareMessageToSign } from '@open-rights-exchange/chainjs/dist/chains/ethereum_1';
import { URLSearchParams } from 'url';

dotenv.config();

interface UserTx {
    txType: string
    oreId: OreIdContext
    txObject?: Transaction
    userObject?: User
    createSendTransaction(fromUser: string, toUser: string, amount: string): Promise<void>
}
=======
import { TransactionData } from 'oreid-js'
import { OreIdWebWidget } from 'oreid-webwidget'


async function createSendTransaction(fromUser: string, toUser: string, amount: string): Promise<Transaction | undefined> {
    dotenv.config();
    // const oreidWebPopUp = new OreidWebPopUp(oreid)

    const appId =  process.env.OREID_APP_ID || ''
    const apiKey =  process.env.OREID_API_KEY
>>>>>>> parent of e464922 (why does this not work?)

class Tx implements UserTx {
    txType: string
    oreId: OreId
    txObject?: Transaction
    userObject?: User

<<<<<<< HEAD
    private getOreId(): OreId {
        const oreId: OreId = new OreId(oreIdOptions)
        return oreId
    }

    constructor( 
        txType: string
    ) {
        this.txType = txType
        this.oreId = this.getOreId()
    }

    private createState(): string {
        const date: Date = new Date
        const state: string = createState(date)
        // const stateBase64 = Buffer.from(state, 'utf8').toString('base64')
        // return base64url.fromBase64(stateBase64)
        return state
    }

    private async getAppToken(): Promise<string> {
        const appAccessTokenMetadata: AppAccessTokenMetadata = {
            paramsNewAccount: undefined,
            newAccountPassword: "",
            currentAccountPassword: "",
            secrets: undefined
        }
        const appTokenParams: ApiGetAppTokenParams = { appAccessTokenMetadata }
        const appToken = await callApiGetAppToken(this.oreId, appTokenParams)
        return appToken
    }

    private async setAppToken(): Promise<void> {
        const appToken: string = await this.getAppToken()
        this.oreId._localState.cachedaccessToken = appToken
    }

    private async getUserInfo( fromUser: string ): Promise<UserSourceData> {
        const params = { account: fromUser }
        const user: UserSourceData = await callApiGetUser(this.oreId, params )
        return user
    }

    private async setUser( fromUser: string ): Promise<void> {
        const user: UserSourceData = await this.getUserInfo( fromUser )
        this.oreId._localState.cachedUser = user
    }

    private getUserObject() {
        const oreIdUser: User = new User({
            oreIdContext: this.oreId, 
            getAccessToken: this.oreId._localState.cachedaccessToken,
            getAccountName: this.oreId._localState.cachedUser.accountName
        })
        this.userObject = oreIdUser
    }

    private async getUserObjectData(): Promise<void> {
        this.getUserObject()
        if ( this.userObject ) {
            try {
                await this.userObject.getData()
            }
            catch (err) {
                errorHandler('getUserObjectData', err)
            }
        }
    }

    private getAuth(): Auth {
        return new Auth({oreIdContext: this.oreId})
    }

    private createTransferActionStruct( toUser: string, amount: string ): EosActionStruct {
        const transferTransaction: EosActionStruct = {
            account: toEosEntityName("eosio.token"),
            name: "transfer",
            authorization: [
                {
                    actor: toEosEntityName(this.oreId._localState.cachedUser.accountName),
                    permission: toEosEntityName("active")
                },
            ],
            data: { 
                from: toEosEntityName(this.oreId._localState.cachedUser.accountName),
                to: toEosEntityName(toUser),
                quantity: toEosAsset(String(amount), toEosSymbol("ORE"), 4),
                memo: "ORE Community Bot Transaction",
            },
        }
        return transferTransaction
    }

    private createOreOptInActionStruct( permissionName: string ) {
        const authorization_object = {
            threshold: 1,
            accounts: [
                {
                    permission: {
                        actor: toEosEntityName(this.oreId._localState.cachedUser.accountName),
                        permission: toEosEntityName('active')
                    },
                    weight: 1,
                },
            ],
            keys: [
                {
                key: "EOS725RKpd7EPM8NYtEV9qNqi7Fpgc5eZgYM5Muqj4oKSSAyXNbFH",
                weight: 1
                },
            ],
            waits: [],
        }
    
        const updateauth_input = {
            account: toEosEntityName(this.oreId._localState.cachedUser.accountName),
            permission: permissionName,
            parent: toEosEntityName("active"),
            auth: authorization_object,
        }
    
        const optIntoOreTransfers: EosActionStruct = {
            account: toEosEntityName('eosio'),
            name: "updateauth",
            authorization: [
                {
                    actor: toEosEntityName(this.oreId._localState.cachedUser.accountName),
                    permission: toEosEntityName("active")
                },
            ],
            data: updateauth_input,
        }

        return optIntoOreTransfers
    }
    
    public async createSendTransaction(
        fromUser: string,
        toUser: string,
        amount: string
    ): Promise<void> {
        await this.setAppToken()
        await this.setUser( fromUser )
        await this.setAppToken()
        this.getUserObject()
        await this.setAppToken()
        await this.getUserObjectData()
        await this.setAppToken()
        const actionStruct: EosActionStruct = this.createTransferActionStruct( toUser, amount )

        const transactionData: TransactionData =  {
            account: toEosEntityName('eosio.token'),
            chainAccount: toEosEntityName(fromUser),
            chainNetwork: ChainNetwork.OreTest,
            transaction: actionStruct,
        }

        if ( this.userObject ) {
            const transactionObject: Transaction = new Transaction({
                oreIdContext: this.oreId,
                user: this.userObject,
                data: transactionData
            })

            this.txObject = transactionObject
        }
    }

    private async getHmac(parsedTransaction: string): Promise<string> {
        return await generateHmacWithApiKeyOrProxyServer(false, process.env.OREID_API_KEY || "", parsedTransaction || '')
        // logHandler.info('hmac append: ' + hmacAppend)
    }

    private async constructUrl(parsedTransaction: string): Promise<string> {
        let signBaseUrl = new URL("https://service.oreid.io/sign")
        // signBaseUrl.searchParams.append("appid", appId)
        signBaseUrl.searchParams.append( "app_id", process.env.OREID_APP_ID || "" )
        signBaseUrl.searchParams.append( "app_access_token", this.oreId._localState.cachedaccessToken )
        signBaseUrl.searchParams.append( "account", this.oreId._localState.cachedUser.accountName )
        // signBaseUrl.searchParams.append("account", 'eosio.token')
        // signBaseUrl.searchParams.append("callback_url", 'http://34.102.183.104/sign')
        signBaseUrl.searchParams.append( "callback_url", "https://callback.sampleapp.com" )
        signBaseUrl.searchParams.append( "chain_network", "ore_test" )
        signBaseUrl.searchParams.append( "chain_account",  this.oreId._localState.cachedUser.accountName  )
        signBaseUrl.searchParams.append( "return_signed_transaction", "true" )
        signBaseUrl.searchParams.append( "allow_chain_account_selection", "false" )
        signBaseUrl.searchParams.append( "broadcast", "false" )
        signBaseUrl.searchParams.append( "provider", "google" )
        // signBaseUrl.searchParams.append("transaction", transactionJsontoBAse64)
        signBaseUrl.searchParams.append("state", this.createState())
        // signBaseUrl.searchParams.append("transaction_chain_account", this.oreId._localState.cachedUser.accountName )
        signBaseUrl.searchParams.append("hmac", await this.getHmac(parsedTransaction))
        // let signUrl = signBaseUrl.href + "&transaction=" + transactionJsontoBAse64
        return signBaseUrl.href + "&transaction=" + parsedTransaction
    }

    public async createTxUrl() {
        // parse transaction from txObject
        if (this.txObject) {
            let signUrl: SignWithOreIdResult = await this.txObject.getSignUrl()
            if (signUrl.signUrl) {
                let parseUrl = new URL(signUrl.signUrl)
                let parseUrl2 = new URLSearchParams(parseUrl.href)
                logHandler.info("parseUrl: " + parseUrl)
                // parseUrl.delete('oauth_access_token')
                let parsedTransaction = parseUrl2.get("transaction")

                logHandler.info("parsedTransaction: " + parsedTransaction)
                await this.setAppToken()

                return await this.constructUrl( parsedTransaction || "" )
            }
        }
    }
}

// async function createSendTransaction(fromUser: string, toUser: string, amount: string) {


    //     let authResult = new Auth({oreIdContext: oreId2})
    // console.log(authResult)
    // authResult.accessTokenHelper._accessToken = appAccessToken
    // authResult.
    // oreId2.auth.setAuthResult(authResult)
    
    // await oreId2._localState.loadAccessToken()
    // await oreId2.auth.user.ac
    // console.log(oreId2.auth.user.accountName)

    
    // oreId2.accessToken = appAccessToken
=======
    let oreId2: OreIdContext = new OreId(oreIdOptions)
    const params = { account: fromUser }
    const botUser = await callApiGetUser(oreId2, params )
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
    // await oreId2.auth.user.getData()
>>>>>>> parent of e464922 (why does this not work?)

    // let newChain = await createOreConnection()
    // let transaction2 = await newChain?.new.Transaction()
    // transaction2?.sign()
    // let user: UserSourceData | undefined = await getUser(toEosEntityName(fromUser))
    // const oreAccount = oreId2.auth.user.data.chainAccounts.find(ca => ca.chainNetwork === "ore_main")
    // let userInfo = await oreId2.callOreIdApi(RequestType.Get, ApiEndpoint.GetUser, {"account": fromUser} )
    // logHandler.info(JSON.stringify(userInfo))
    // await userInfo.getData()
    // if (oreAccount) {
<<<<<<< HEAD
    

    // const authorization_object = {
    //     threshold: 1,
    //     accounts: [
    //         {
    //             permission: {
    //                 actor: toEosEntityName(fromUser),
    //                 permission: toEosEntityName('botuser')
    //             },
    //             weight: 1,
    //         },
    //     ],
    //     keys: [
    //         {
    //         key: "EOS725RKpd7EPM8NYtEV9qNqi7Fpgc5eZgYM5Muqj4oKSSAyXNbFH",
    //         weight: 1
    //         },
    //     ],
    //     waits: [""],
    // };

    // const updateauth_input = {
    //     account: toEosEntityName(fromUser),
    //     permission: "orebot",
    //     parent: toEosEntityName("active"),
    //     auth: authorization_object,
    // };

    // const optIntoOreTransfers: EosActionStruct = {
    //     account: toEosEntityName('eosio'),
    //     name: "updateauth",
    //     authorization: [
    //         {
    //             actor: toEosEntityName(fromUser),
    //             permission: toEosEntityName("active")
    //         },
    //     ],
    //     // data: Buffer.from(JSON.stringify(updateauth_input), "utf8").toString('hex')
    //     data: updateauth_input,
    // };




    

    // const transferTransactionJSON =
    // const signOptions: TransactionSignOptions = {
    //     provider: AuthProvider.Google,
    //     broadcast: false,
    //     state: "abc",
    //     returnSignedTransaction: true,
    //     callbackUrl: process.env.OREID_SIGN_CALLBACK_URL || 'https://app.sampleapp.com',
    //     preventAutosign: false,
    // };

    

    
    
    // logHandler.info(oreId2.accessTokenHelper.accessToken)


    
    // await oreId2.auth.user.getData()
    // let accessToken: AccessTokenHelper = new AccessTokenHelper()
    // console.log(accessToken)
    // await oreId2.auth.user.getData()
    // let oreid2 = new OreId(oreIdOptions)
    // const oreIdUser: User = new User({oreIdContext: oreId2, getAccessToken: oreId2._localState.cachedaccessToken, getAccountName: botUser.accountName})
    

    // const transactionObject: Transaction = new Transaction({oreIdContext: oreId2, user: oreIdUser, data: transactionData})

    





    // const apiSignOptions: ApiSignTransactionParams = {
    //     autoSign: true,
    //     transactionData: transactionData
    // }

    // let oreConnection = await createOreConnection()
    // if (oreConnection) {
    //     let transaction = await oreConnection.new.Transaction()
    //     if (transaction) {
            // await transaction.addAction(optIntoOreTransfers)
            // logHandler.info(JSON.stringify(transaction.toJson))

            // await transaction.setTransaction([optIntoOreTransfers])
            // await transaction.setTransaction([transferTransaction])
            // const transactionJson3 = transaction.toJson()
            // await transaction.prepareToBeSigned()
            // await transaction.validate()
            // const transactionRaw = await transaction.raw
            // const transactionJson = await JSON.parse(JSON.stringify(transaction.toJson()))
            // logHandler.info("transactionJSON: " + transactionJson)
            // logHandler.info(JSON.stringify(transactionJson3))
            //remove signatures null
            // const transactionJsontoBAse64 = Buffer.from(transactionJson.toString()).toString('base64')
            // transactionJson.signatures = "None"
            // const transactionJsontoBAse64 = Buffer.from(JSON.stringify(transactionJson)).toString("base64")
            // const transactionJsontoBAse64 = btoa(JSON.stringify(transactionJson))

            // logHandler.info('transactionJsontoBase64: ' + transactionJsontoBAse64)
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

            // const transactionObject: Transaction = new Transaction({oreIdContext: oreId2, user: oreIdUser, data: transactionData})

            // await transactionObject.data.signOptions?.accessToken
            // const transactionCreate = await oreId2.createTransaction(transactionData)
            // const signObj = await transactionObject.getSignUrl()
            // logHandler.info(signObj.signUrl)
            // let signUrl2 = new URL(signObj.signUrl || '' )

            // let parsedSignUrl: JSONObject = JSON.parse(JSON.stringify(await transactionObject.getSignUrl()))
            
            // let parseUrl = new URLSearchParams(signUrl2.href)
            // logHandler.info("parseUrl: " + parseUrl)
            // parseUrl.delete('oauth_access_token')
            // let parsedTransaction = parseUrl.get("transaction")

            // logHandler.info("parsedTransaction: " + parsedTransaction)



            

            // let base64Output = ''
            // for ( let txn in transactionRaw) {
            //     base64Output = base64Output + transactionRaw[txn]

            // }

            // let transaction2 = Buffer.from(transaction.raw, 'binary').toString('base64')
            // transaction2 = transaction.raw.toString('base64')

            // let oreId2: OreId = new OreId(oreIdOptions)
            // const params = { account: fromUser }
            // const botUser: UserSourceData = await callApiGetUser(oreId2, params )
            // logHandler.info('botUser: ' + botUser.accountName)
        
            // let appAccessTokenMetadata: AppAccessTokenMetadata = {
            //     paramsNewAccount: undefined,
            //     newAccountPassword: "",
            //     currentAccountPassword: "",
            //     secrets: undefined,
            // };
            // let accessTokenParams: ApiGetAppTokenParams = { appAccessTokenMetadata } 
            // let appAccessToken2 = await callApiGetAppToken(oreId2, accessTokenParams)
            // logHandler.info('appAccessToken2: ' + appAccessToken2)

            


            // const prepared: string = prepareMessageToSign(transaction.raw)
            // // const newAccessToken = await oreId2.getAppAccessToken()
            // // logHandler.info("newacessToken: " + newAccessToken)
            // // localStorage.getItem()
            // // oreId2.accessTokenHelper.setAccessToken(appAccessToken)
            // // oreId2.accessToken = appAccessToken
            // const { user } = oreId2.auth
            // await user.getData()
            // console.log(user.accountName)
            // logHandler.info("preparedToSign: " + prepared)

        //    const base64Prepared = Buffer.from(prepared, 'utf8').toString('base64')
        //    logHandler.info(base64Prepared)
        //    const base64preparedurl = base64url.fromBase64(base64Prepared)

        //    const hmac = generateHmac('2233', base64String)

        //    const hmacAppend = await generateHmacWithApiKeyOrProxyServer(false, apiKey, parsedTransaction || '')
        //    logHandler.info('hmac append: ' + hmacAppend)

            // await oreId2.getUser()

            // const bitArrayToBAse64 = bitArrayToBase64String(base64Output)
            // logHandler.info("bitArraytoBase64: "  + bitArrayToBAse64)
        
            // let signBaseUrl = new URL("https://service.oreid.io/sign")
                // signBaseUrl.searchParams.append("appid", appId)
                // signBaseUrl.searchParams.append("app_id", appId)
                // signBaseUrl.searchParams.append("app_access_token", appAccessToken)
                // signBaseUrl.searchParams.append("account", botUser.accountName)
                // signBaseUrl.searchParams.append("account", 'eosio.token')
                // signBaseUrl.searchParams.append("callback_url", 'http://34.102.183.104/sign')
                // signBaseUrl.searchParams.append("callback_url", "https://callback.sampleapp.com")
                // signBaseUrl.searchParams.append("chain_network", "ore_test")
                // signBaseUrl.searchParams.append("chain_account",  botUser.accountName)
                // signBaseUrl.searchParams.append("return_signed_transaction", "true")
                // signBaseUrl.searchParams.append("allow_chain_account_selection", "false")
                // signBaseUrl.searchParams.append("broadcast", "false")
                // signBaseUrl.searchParams.append("provider", "google")
                // signBaseUrl.searchParams.append("transaction", transactionJsontoBAse64)
                // signBaseUrl.searchParams.append("state", state)
                // signBaseUrl.searchParams.append("transaction_chain_account", botUser.accountName)
                // signBaseUrl.searchParams.append("hmac", hmacAppend)
                // let signUrl = signBaseUrl.href + "&transaction=" + transactionJsontoBAse64
                // let signUrl = signBaseUrl.href + "&transaction=" + parsedTransaction
                // const hmacUrl =  await oreId2.addAccessTokenAndHmacToUrl(signBaseUrl.href, appAccessTokenMetadata)
                // const hmacUrl =  await oreId2.addAccessTokenAndHmacToUrl(signUrl, appAccessTokenMetadata)


            // const signTransaction: string = hmacUrl
            // const signTransaction: string = signBaseUrl.href
            // const signTransaction: string = signUrl 

            // const signTransaction2 = await oreId2.addAccessTokenAndHmacToUrl(signUrl.href, appAccessTokenMetadata, )
            // const signTransaction2 = signUrl + "&app_access_token=" + appAccessToken2 + "&hmac=" + hmacAppend
            // const signTransaction2 = signUrl  + "&hmac=" + hmacAppend //+ "&app_access_token=" + appAccessToken2

            // logHandler.info('sign address: ' + signTransaction2)
            // logHandler.info('sign address: ' + signTransaction)

            

            

    //         return signTransaction2
    //     }
    // }


=======
        const transferTransaction: EosActionStruct = {
            account: toEosEntityName('eosio.token'),
            name: 'transfer',
            authorization: [
                {
                    actor: toEosEntityName(fromUser),
                    permission: toEosEntityName('app1szepveui'),
                },
            ],
            data: { 
                from: toEosEntityName(fromUser),
                to: toEosEntityName(toUser),
                quantity:  toEosAsset(String(amount), toEosSymbol('ORE'), 4),
                memo: "Transfer from ORE Community Bot"
            }
        }
        const signOptions: TransactionSignOptions = {
            provider: AuthProvider.OreId, // wallet type (e.g. 'algosigner' or 'oreid')
            broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
            state: 'abc', // anything you'd like to remember after the callback
            returnSignedTransaction: false,
            callbackUrl: process.env.OREID_SIGN_CALLBACK_URL
            // preventAutosign: false, // prevent auto sign even if transaction is auto signable
        }
>>>>>>> parent of e464922 (why does this not work?)



        const transactionData: TransactionData =  {
            account: 'eosio.token',
            chainAccount: toEosEntityName(fromUser),
            chainNetwork: ChainNetwork.OreTest,
            transaction: transferTransaction,
            expireSeconds: 1000,
            signOptions: signOptions,
        }

        const apiSignOptions: ApiSignTransactionParams = {
            autoSign: false,
            transactionData: transactionData
        }

       
        let oreId3 = new OreId(oreIdOptions)
        // await oreId3.auth.user.getData()
        // logHandler.info(oreId3.auth.user.data.chainAccounts)
        // let chain = await createOreConnection()
        // // if (chain) {
        // //     let transactionfromChain = await chain.new.Transaction(transactionData)
        // //     await transactionfromChain.prepareToBeSigned()
        // //     transaction = transactionfromChain
        // // }
        
        await oreId3.auth.user.getData()
        // // logHandler.info(JSON.stringify(oreId3.accessTokenHelper))
        // // logHandler.info(oreId3.auth.accessToken)
        // let newAppToken = await callApiGetAppToken(oreId3, accessTokenParams)
        // logHandler.info("newAppToken: " + newAppToken)
        // oreId3.accessTokenHelper.setAccessToken(newAppToken)
        // await oreId3.auth.user.getData()
        // logHandler.info(oreId3.auth.user.data.accountName)

        // oreId3.accessTokenHelper.setAccessToken(newAppToken)

        // logHandler.info("")
        // let transaction: Transaction = await oreId3.createTransaction(transactionData)
        // logHandler.info('Transaction Url: '  + transaction.getSignUrl)

    // const transaction1 = await callApiSignTransaction(oreId2, apiSignOptions)
    // logHandler.info('transaction1: ' + transaction1)
    // let transaction = await oreId3.callOreIdApi(RequestType.Get, ApiEndpoint.TransactionSign, transactionData)
    let transaction = oreId3.createTransaction({...transactionData})
    // 
    //     logHandler.info(JSON.stringify(transactin.))
    // }
<<<<<<< HEAD
    
// }

(async () => {
    try {
        const tx: Tx = new Tx('transfer')
        await tx.createSendTransaction("ore1sbx3rf4j", "ore1sqvihyhs", "0.001" )
        if ( tx.txObject ) {
            logHandler.info("Raw Transaction: " + await tx.createTxUrl())
        }
=======
    return transaction
}

(async () => {
    try {
        await createSendTransaction('ore1sbx3rf4j', 'ore1sqvihyhs', "0.001" )
>>>>>>> parent of e464922 (why does this not work?)
    }
    catch (err) {
        logHandler.error('createSendTransaction', err)
    }
})()

export async function initiateSign(
    accountName: AccountName,
    chainNetwork: ChainNetwork,
    provider: AuthProvider,
    transaction: JSONObject ): Promise< string > {
    // 
    // Returns a string with the url which signs the transaction in ORE-ID
    // 
    const oreId: OreId = new OreId(oreIdOptions)
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

