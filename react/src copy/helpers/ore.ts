import { Chain, ChainFactory } from "@open-rights-exchange/chainjs"
import { EosActionStruct, EosChainEndpoint } from "@open-rights-exchange/chainjs/dist/chains/eos_2/models"
import {
    ChainSettings,
	ChainType,
	SignatureBrand,
} from "@open-rights-exchange/chainjs/dist/models"


const chainType: ChainType = ChainType.EosV2

const chainSetting: ChainSettings = {
    unusedAccountPublicKey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma'
}

const oreTestNetEndpoint: EosChainEndpoint = {
    url: "https://ore-staging.openrights.exchange"
}

const oreTestNetEndpoint2: EosChainEndpoint = {
    url: "https://ore-staging2.openrights.exchange"
}

const oreTestNetEndpoints: EosChainEndpoint[] = [
    oreTestNetEndpoint,
    oreTestNetEndpoint2
]

const oreMainnetEndpoint: EosChainEndpoint = {
    url: "https://ore.openrights.exchange"
}

interface connection {
    chainType: ChainType
    chainSettings: ChainSettings
    chainEndpoints: EosChainEndpoint[]
    chain: Chain
    connect(): Promise<void>
}

export class OreConnection implements connection {
    chainType: ChainType = chainType
    chainSettings: ChainSettings = chainSetting
    chainNetwork: string = process.env.REACT_APP_CURRENCY_STAGE || "testnet"
    chainEndpoints: EosChainEndpoint[]
    chain: Chain

    constructor() {
        this.chainEndpoints = oreTestNetEndpoints
        if (this.chainNetwork == 'mainnet') {
            this.chainEndpoints = [oreMainnetEndpoint]
        }

        this.chain = new ChainFactory().create( this.chainType, this.chainEndpoints, this.chainSettings )
    }

    public async connect(): Promise<void> {
        await this.chain.connect()
    }
}
