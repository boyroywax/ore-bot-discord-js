import { HelpersEos } from '@open-rights-exchange/chainjs'
import { AccountType } from 'oreid-js'
import { PrivateKey, PrivateKeyBrand, PublicKey } from '@open-rights-exchange/chainjs/dist/models'
import { Chain, Transaction } from '@open-rights-exchange/chainjs'
import { TransactionResult } from '@open-rights-exchange/chainjs/src/models'
import { EosNewAccountType, EosAccountStruct, EosActionStruct, EosChainActionType } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { EosAccount, EosTransaction } from '@open-rights-exchange/chainjs/dist/chains/eos_2'
import { ChainEosV2 } from '@open-rights-exchange/chainjs'
import { toEosAsset, toEosEntityName, toEosPrivateKey } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'

import { OreResourceActions } from '../interfaces/OreChain'
import { createOreConnection } from "../modules/chains"
import { errorHandler } from "./errorHandler"
import { getUser } from "../modules/oreid"
import { logHandler } from './logHandler'


export class AccountResources implements OreResourceActions {
    oreId: string = process.env.BOT_TREASURER_OREID || "ore1sqvihyhs"
    status: string = "Creating OreResourceActions Object"
    message: string = "Loading keys"
    activePublicKey: PublicKey = process.env.BOT_TREASURER_ACTIVE_PUB_KEY || ''
    activePrivateKey: PrivateKey = process.env.BOT_TREASURER_ACTIVE_PRIV_KEY || ''
    ownerPublicKey: PublicKey = process.env.BOT_TREASURER_OWNER_PUB_KEY || ''
    ownerPrivateKey: PrivateKey = process.env.BOT_TREASURER_OWNER_PRIV_KEY || ''

    public async buyRam(amount: number): Promise<[boolean, string]> {
        let buyCompleted: boolean = false
        let buyStatus: string = "Ram purchase initiated."
        const resources: EosActionStruct = {
            account: toEosEntityName('eosio'),
            name: 'buyram',
            authorization: [
                {
                    actor: toEosEntityName('app.oreid'),
                    permission: toEosEntityName('active'),
                },
            ],
            data: { 
                payer: toEosEntityName('app.oreid'),
                receiver: toEosEntityName(this.oreId),
                quant: amount,
            }
        }
        return [buyCompleted, buyStatus]
    }

    public async buyRamBytes(ramBytes?: number): Promise<[boolean, string]> {
        // 
        // Add resources to an ORE account
        // 

        let buyCompleted: boolean = false
        let buyStatus: string = "Ram bytes purchase initiated."
        const resources: EosActionStruct = {
            account: toEosEntityName('eosio'),
            name: 'buyrambytes',
            authorization: [
                {
                    actor: toEosEntityName('app.oreid'),
                    permission: toEosEntityName('active'),
                },
            ],
            data: { 
                payer: toEosEntityName('app.oreid'),
                receiver: toEosEntityName(this.oreId),
                bytes: ramBytes,
            }
        }

        const oreConnection = await createOreConnection()
        logHandler.info('ore status: ' + JSON.stringify(oreConnection))

        if (oreConnection) {
            const sontract = await oreConnection.fetchContractData('eosio', 'rammarket', 'eosio')
            logHandler.info(JSON.stringify(sontract))
            const transaction: EosTransaction = (await oreConnection.new.Transaction()) as EosTransaction
            if (transaction) {
                transaction.actions = [resources]
                await transaction.prepareToBeSigned()
                await transaction.validate()
                const key: PrivateKeyBrand = toEosPrivateKey(process.env.ORE_TESTNET_APPOREID_PRIVATE_KEY || '')
                await transaction.sign([ key ])
                if (transaction.missingSignatures) { 
                    logHandler.info('missing sigs: ' + transaction.missingSignatures)
                }
        
                const good = transaction.isEosActionStructArray([resources])
                logHandler.info('isEosActionStructArray? ' + good)
                logHandler.info(JSON.stringify(transaction.toJson()))
                const txResponse = await transaction.send()
                logHandler.info('send response:', JSON.stringify(txResponse.response.toJson()))
                buyCompleted = true
                buyStatus = "Txn Id: " + txResponse.response.txid
            }
        }
    return [ buyCompleted, buyStatus]
    }

    public async delegateCpuNet(cpu: number, net: number): Promise<[boolean, string]> {
        let delegationCompleted: boolean = false
        let delegationStatus: string = "Initiating resource delegation."


        return [ delegationCompleted, delegationStatus]
    }


}

export async function buyRamByBytes() {
    try {
        const ramAmountBytes: number = 9182
        const ramPurchase = new AccountResources
        logHandler.info('Buying ram for: ' + ramPurchase.oreId)
        logHandler.info("Amount (bytes) RAM to be purchased: " + ramAmountBytes)
        await ramPurchase.buyRamBytes(ramAmountBytes)
    }
    catch (err) {
        errorHandler('buyRam', err)
    }
}


(async () => {
    try {
        await buyRamByBytes()
    }
    catch (err) {
        errorHandler('bad buy', err)
    }
})()