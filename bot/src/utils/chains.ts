import { ChainFactory, ChainType, Chain } from '@open-rights-exchange/chainjs'
import { ChainEndpoint } from '@open-rights-exchange/chainjs/src/models/'
import { ApiEndpoint, AppAccessTokenMetadata, AuthProvider, ChainNetwork, OreId, RequestType, Transaction, TransactionSignOptions } from 'oreid-js'
import { TransactionOptions } from '@open-rights-exchange/chainjs/dist/models'
import { EosActionStruct } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { callApiGetUser, callApiGetAppToken, ApiGetAppTokenParams } from 'oreid-js/dist/api'
import OreIdContext from 'oreid-js/dist/core/IOreidContext'
import { toEosEntityName, toEosAsset, toEosSymbol } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'


import { logHandler } from "./logHandler"
import { errorHandler } from "./errorHandler"
import { oreIdOptions } from './oreid'



export async function newChain(network: string, stage: string): Promise<Chain | undefined> {
    // 
    // Create Chain Object
    // 
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

 
export async function createOreConnection(): Promise<Chain | undefined> {
    // 
    // Create ORE Network Connection
    //
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

    let appAccessTokenMetadata: AppAccessTokenMetadata = {
        paramsNewAccount: undefined,
        newAccountPassword: "",
        currentAccountPassword: "",
        secrets: undefined
    }
    let accessTokenParams: ApiGetAppTokenParams = { appAccessTokenMetadata } 
    let appAccessToken = await callApiGetAppToken(oreId2, accessTokenParams)
    logHandler.info('appAccessToken: ' + appAccessToken)

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

    const signOptions: TransactionSignOptions = {
        provider: AuthProvider.OreId, // wallet type (e.g. 'algosigner' or 'oreid')
        broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
        state: 'abc', // anything you'd like to remember after the callback
        returnSignedTransaction: false,
        preventAutosign: false, // prevent auto sign even if transaction is auto signable
    }

    const transactionData: TransactionOptions =  {
        chainAccount: toEosEntityName(fromUser),
        chainNetwork: ChainNetwork.OreTest,
        transaction: transferTransaction,
        signOptions: signOptions,
    }

    let oreId3 = new OreId(oreIdOptions)
    transaction = await oreId3.callOreIdApi(RequestType.Post, ApiEndpoint.TransactionSign, transactionData)
    // transaction: Transaction = await oreId3.createTransaction(transactionData) 
    if (transaction) {
        logHandler.info(await transaction.getSignUrl())
    }

    return transaction
}


