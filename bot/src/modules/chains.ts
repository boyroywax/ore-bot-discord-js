import { ChainFactory, ChainType, Chain } from '@open-rights-exchange/chainjs'
import { ChainEndpoint, ChainActionType  } from '@open-rights-exchange/chainjs/src/models/'
import { logHandler } from "../utils/logHandler"
import { errorHandler } from "../utils/errorHandler"


// 
// Create ORE Network Connection
// 
export async function OreConnection() {
    let oreChain: Chain
    try {
        const chainType =  ChainType.EosV2
        const oreEndpoints: ChainEndpoint[] = [
            { 
                url: "https://ore.openrights.exchange",
            },
        ]
        oreChain = new ChainFactory().create( chainType, oreEndpoints )
        await oreChain.connect()
        return oreChain
    }
    catch (err) {
        errorHandler('OreConnection failed: ', err)
    }
}

