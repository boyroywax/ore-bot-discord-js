import { ChainFactory, ChainType, Chain } from '@open-rights-exchange/chainjs'
import { ChainEndpoint } from '@open-rights-exchange/chainjs/src/models/'
import { ApiEndpoint, AppAccessTokenMetadata, ChainNetwork, OreId, RequestType, Transaction, UserSourceData } from 'oreid-js'
import User from 'oreid-js/dist/user/user'

import { logHandler } from "./logHandler"
import { errorHandler } from "./errorHandler"
import { toEosEntityName, toEosAsset, toEosSymbol } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'
import { oreIdOptions } from './oreid'
import { TransactionOptions } from '@open-rights-exchange/chainjs/dist/models'
import { EosActionStruct } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { callApiGetUser } from 'oreid-js/dist/api'
import { ApiGetUserParams } from 'oreid-js/dist/api'
import { callApiGetAppToken } from 'oreid-js/dist/api'
import { ApiGetAppTokenParams } from 'oreid-js/dist/api'
import OreIdContext from 'oreid-js/dist/core/IOreidContext'
import * as dotenv from 'dotenv'

// 
// Create Chain Object
// 
export async function newChain(network: string, stage: string): Promise<Chain | undefined> {
    let chain: Chain | undefined = undefined
    let endpoints: ChainEndpoint[]
    const chainSettings = {
        unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    }
    try {
        // Check which network the chain is on
        if ( network == "ORE" ) {
            const chainType = ChainType.EosV2
            // Check which stage the chain is on
            if ( stage == "testnet" ) {
                // ORE Network TestNet Endpoint
                endpoints = [
                    { 
                        url: process.env.CURRENCY_TESTNET || "https://ore-staging.openrights.exchange/",
                    },
                    {
                        url: 'https://ore-staging2.openrights.exchange/',
                    },
                ]
                chain = new ChainFactory().create( chainType, endpoints, chainSettings )
            }
            else if ( stage == "mainnet" ) { 
                // ORE Network Production Endpoint
                endpoints = [
                    { 
                        url: process.env.CURRENCY_MAINNET  || "https://ore.openrights.exchange/",
                    },
                ]
                chain = new ChainFactory().create( chainType, endpoints, chainSettings )
            }
        }
    } 
    catch (err) {
        errorHandler("newChain failed: ", err)
    }
    return chain
}

// 
// Create ORE Network Connection
// 
export async function createOreConnection(): Promise<Chain | undefined> {
    const network: string = "ORE"
    const stage: string = process.env.CURRENCY_STAGE || 'testnet'
    
    let oreChain = await newChain( network, stage )

    try {
        if (oreChain) {
            // Check that the network is running
            await oreChain.connect()
            logHandler.info('ORE Network Connection: ' + oreChain.isConnected)
        }

    }
    catch (err) {
        errorHandler('oreConnection failed: ', err)
    }
    return oreChain
}

export async function createSendTransaction(fromUser: string, toUser: string, amount: string): Promise<Transaction | undefined> {

    let transaction: Transaction | undefined = undefined

    let oreId2: OreIdContext = new OreId(oreIdOptions)
    const params = { account: fromUser }
    const botUser = await callApiGetUser(oreId2, params )
    logHandler.info('botUser: ' + botUser.accountName)

    let appAccessTokenMetadata: AppAccessTokenMetadata = {}
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
                    permission: toEosEntityName('active'),
                },
            ],
            data: { 
                from: toEosEntityName(fromUser),
                to: toEosEntityName(toUser),
                quantity:  toEosAsset(String(amount), toEosSymbol('ORE'), 4),
                memo: "Transfer from ORE Community Bot"
            }
        }

        const transactionData: TransactionOptions =  {
            chainAccount: toEosEntityName(fromUser),
            chainNetwork: ChainNetwork.OreTest,
            transaction: transferTransaction,
            signOptions: { "broadcast": true, "returnSignedTransaction": false },
        }
        let oreId3 = new OreId(oreIdOptions)
        // transaction = await oreId2.(transactionData)
        transaction = await oreId3.callOreIdApi(RequestType.Post, ApiEndpoint.TransactionSign, transactionData)
        if (transaction) {
            logHandler.info(await transaction.getSignUrl())
        }
    // }
    return transaction
}


