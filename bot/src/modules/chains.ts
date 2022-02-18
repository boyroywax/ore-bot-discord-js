import { ChainFactory, ChainType, Chain } from '@open-rights-exchange/chainjs'
import { ChainEndpoint, ChainInfo  } from '@open-rights-exchange/chainjs/src/models/'
import { logHandler } from "../utils/logHandler"
import { errorHandler } from "../utils/errorHandler"



export async function newOreConnection(): Promise<Chain | undefined> {
    let oreChain = undefined
    try {
        const chainType =  ChainType.EosV2
        const oreEndpoints: ChainEndpoint[] = [
            { 
                url: "https://ore.openrights.exchange",
            },
        ]
        oreChain = new ChainFactory().create( chainType, oreEndpoints )
        
    } 
    catch (err) {
        errorHandler("newOreConnection failed: ", err)
    }
    return oreChain
}


// 
// Create ORE Network Connection
// 
export async function createOreConnection() {
    // 
    // 
    let oreChain = await newOreConnection()
    try {
        if (oreChain) {
           await oreChain.connect()
        }
    }
    catch (err) {
        errorHandler('oreConnection failed: ', err)
    }
    return oreChain
}


