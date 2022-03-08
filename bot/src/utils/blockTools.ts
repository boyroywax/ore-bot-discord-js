import { Chain } from "@open-rights-exchange/chainjs"
import { OreBlock } from "../interfaces/OreChain"
import { createOreConnection } from "../modules/chains"
import { errorHandler } from "./errorHandler"
import { logHandler } from "./logHandler"

export class BlockExplorer implements OreBlock {
    timestamp: Date = new Date
    producer: string = 'None'
    confirmed: number = 0
    previous: string = "0000000000000000000000000000000000000000000000000000000000000000"
    transaction_mroot: string = "0000000000000000000000000000000000000000000000000000000000000000"
    action_mroot: string = "0000000000000000000000000000000000000000000000000000000000000000"
    schedule_version: number = 0
    new_producers: null = null
    header_extensions: string[] = []
    producer_signature: string = "SIG_K1_11111111111111111111111111111111111111111111111111111111111111111111111"
    transactions: string[] = []
    block_extensions: string[] = []
    id: string = "0000000000000000000000000000000000000000000000000000000000000000"
    block_num: number = 0
    ref_block_prefix: string = "0000000000"

    private async writeBlock(blockFromApi: any ): Promise<boolean> {
        let completed = false
        this.timestamp = blockFromApi.timestamp
        this.producer = blockFromApi.producer
        this.confirmed = blockFromApi.confirmed
        this.previous = blockFromApi.previous
        this.transaction_mroot = blockFromApi.transaction_mroot
        this.action_mroot = blockFromApi.action_mroot
        this.schedule_version = blockFromApi.schedule_version
        this.new_producers = blockFromApi.new_producers || null
        this.header_extensions = blockFromApi.block_extensions
        this.producer_signature = blockFromApi.producer_signature
        this.transactions = blockFromApi.transactions
        this.block_extensions = blockFromApi.block_extensions
        this.id = blockFromApi.id
        this.block_num = blockFromApi.block_num
        this.ref_block_prefix = blockFromApi.ref_block_prefix
        logHandler.info(JSON.stringify(this))
        return completed = true


    }

    public async getBlock(blockNumber: number): Promise<void> {


    }

    public async getLatestBlock(): Promise<void> {
        let oreConnection = await createOreConnection()
        if (oreConnection) {
            const block: number = ( oreConnection.chainInfo.headBlockNumber || 0)
            const blockFromApi = oreConnection.chainInfo
            const written: boolean = await this.writeBlock(blockFromApi)
            logHandler.info("latest block: " + block)
        }
    }

}


(async () => {
    try {
        const blockEx = new BlockExplorer 
        await blockEx.getLatestBlock()
    }
    catch (err) {
        errorHandler('bad block', err)
    }
})()