import { ChainFactory, ChainType, Chain } from '@open-rights-exchange/chainjs'
import { ChainEndpoint } from '@open-rights-exchange/chainjs/src/models/'
import { ApiEndpoint, AppAccessTokenMetadata, AuthProvider, ChainNetwork, OreId, RequestType, Transaction, TransactionSignOptions, UserSourceData, AccountName,  SignWithOreIdResult, JSONObject} from 'oreid-js'
import * as dotenv from 'dotenv';

import { logHandler } from "./utils/logHandler"
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
import { OreIdWebWidget } from 'oreid-webwidget'


async function createSendTransaction(fromUser: string, toUser: string, amount: string): Promise<Transaction | undefined> {
    dotenv.config();
    // const oreidWebPopUp = new OreidWebPopUp(oreid)

    const appId =  process.env.OREID_APP_ID || ''
    const apiKey =  process.env.OREID_API_KEY

    // let transaction: Transaction | undefined = undefined

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

    // let newChain = await createOreConnection()
    // let transaction2 = await newChain?.new.Transaction()
    // transaction2?.sign()
    // let user: UserSourceData | undefined = await getUser(toEosEntityName(fromUser))
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
    return transaction
}

(async () => {
    try {
        await createSendTransaction('ore1sbx3rf4j', 'ore1sqvihyhs', "0.001" )
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

