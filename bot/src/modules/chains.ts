import { ChainFactory, ChainType, Chain } from '@open-rights-exchange/chainjs'
import { ChainEndpoint } from '@open-rights-exchange/chainjs/src/models/'

import { logHandler } from "../utils/logHandler"
import { errorHandler } from "../utils/errorHandler"

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


