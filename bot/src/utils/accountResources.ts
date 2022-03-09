import { PrivateKey, PrivateKeyBrand, PublicKey } from '@open-rights-exchange/chainjs/dist/models'
import { EosActionStruct, EosPrivateKey } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { EosTransaction } from '@open-rights-exchange/chainjs/dist/chains/eos_2'
import { toEosAsset, toEosEntityName, toEosPrivateKey, toEosSymbol } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'

import { OreResourceActions } from '../interfaces/OreChain'
import { createOreConnection } from "../modules/chains"
import { errorHandler } from "./errorHandler"
import { logHandler } from './logHandler'

export class AccountResources implements OreResourceActions {
    oreId: string = process.env.BOT_TREASURER_OREID || "ore1sqvihyhs"
    status: string = "Creating OreResourceActions Object"
    message: string = "Loading keys"
    activePublicKey: PublicKey = toEosPrivateKey(process.env.BOT_TREASURER_ACTIVE_PUB_KEY || '')
    activePrivateKey: PrivateKey = toEosPrivateKey(process.env.BOT_TREASURER_ACTIVE_PRIV_KEY || '')
    ownerPublicKey: PublicKey = toEosPrivateKey(process.env.BOT_TREASURER_OWNER_PUB_KEY || '')
    ownerPrivateKey: PrivateKey = toEosPrivateKey(process.env.BOT_TREASURER_OWNER_PRIV_KEY || '')

    appOreIdKey: PrivateKeyBrand = toEosPrivateKey(process.env.ORE_TESTNET_APPOREID_PRIVATE_KEY || '');

    private async executeTxn(action: EosActionStruct, key: EosPrivateKey[]): Promise<[boolean, string]> {
        let completed: boolean = false
        let status: string = "ExecuteTxn initiating."
        const oreConnection = await createOreConnection()
        logHandler.info('ore status: ' + JSON.stringify(oreConnection))

        if (oreConnection) {
            const transaction: EosTransaction = (await oreConnection.new.Transaction()) as EosTransaction
            if (transaction) {
                transaction.actions = [action]
                await transaction.prepareToBeSigned()
                await transaction.validate()
                await transaction.sign([this.appOreIdKey])
                if (transaction.missingSignatures) { 
                    logHandler.info('missing sigs: ' + JSON.stringify(transaction.missingSignatures))
                }
        
                // const good = transaction.isEosActionStructArray([action])
                // logHandler.info('isEosActionStructArray? ' + good)
                // logHandler.info("transaction: " + JSON.stringify(transaction.toJson()))
                const txResponse = await transaction.send()
                // logHandler.info('send response:', JSON.stringify(transaction.sendReceipt))
                completed = true
                status = "Txn Id: " + transaction.transactionId
            }
        }
        return [completed, status]
    }

    public async addSYS(amount: string): Promise<[boolean, string]> {
        let success: boolean = false
        let status: string = "Adding SYS to Account"

        const resources: EosActionStruct = {
            account: toEosEntityName('eosio.token'),
            name: 'transfer',
            authorization: [
                {
                    actor: toEosEntityName('app.oreid'),
                    permission: toEosEntityName('active'),
                },
            ],
            data: { 
                from: toEosEntityName('app.oreid'),
                to: toEosEntityName(this.oreId),
                quantity:  toEosAsset(amount, toEosSymbol('SYS'), 4),
                memo: "ORE Community Bot Top up"
            }
        };
        [success, status] = await this.executeTxn(resources, [this.appOreIdKey])

        return [success, status]
    }

    public async buyRam(amount: number): Promise<[boolean, string]> {
        let buyCompleted: boolean = false
        let buyStatus: string = "Ram purchase initiated."
        try {
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
            let key: PrivateKeyBrand = toEosPrivateKey(process.env.ORE_TESTNET_APPOREID_PRIVATE_KEY || '5Jka7TQfp77QzgVYhXGbXuT21fKgdJiUgNHhMxneJNzZqsS4CXi');
            [ buyCompleted, buyStatus ] = await this.executeTxn(resources,[this.appOreIdKey])
        }
        catch (err) {
            errorHandler("buyRam", err)
        }
        return [buyCompleted, buyStatus]
    }

    public async buyRamBytes(ramBytes: number): Promise<[boolean, string]> {
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
        };
        [ buyCompleted, buyStatus] = await this.executeTxn(resources, [this.appOreIdKey])
        return [ buyCompleted, buyStatus]
    }

    public async delegateCpuNet(cpu: string, net: string): Promise<[boolean, string]> {
        let delegationCompleted: boolean = false
        let delegationStatus: string = "Initiating resource delegation."
        const resources: EosActionStruct = {
            account: toEosEntityName('eosio'),
            name: 'delegatebw',
            authorization: [{
                actor: toEosEntityName(this.oreId) ,
                permission: toEosEntityName('active'),
            }],
            data: {
                from: toEosEntityName(this.oreId),
                receiver: toEosEntityName(this.oreId),
                stake_net_quantity: toEosAsset(net, toEosSymbol('SYS'), 4),
                stake_cpu_quantity: toEosAsset(cpu, toEosSymbol('SYS'), 4),
                transfer: false,
            }
        }
        const key: [EosPrivateKey] = [this.activePrivateKey] || [];
        
        [delegationCompleted, delegationStatus] = await this.executeTxn(resources, key);
        return [delegationCompleted, delegationStatus]
    }
}

export async function buyRamByBytes(ramAmountBytes: number = 9182): Promise<boolean> {
    let success: boolean = false
    try {
        const ramPurchase = new AccountResources
        logHandler.info('Buying ram for: ' + ramPurchase.oreId)
        logHandler.info("Amount (bytes) RAM to be purchased: " + ramAmountBytes)
        await ramPurchase.buyRamBytes(ramAmountBytes)
        success = true
    }
    catch (err) {
        errorHandler('buyRamBytes', err)
    }
    return success
}


// (async () => {
//     try {
//         await buyRamByBytes()
//     }
//     catch (err) {
//         errorHandler('bad buy', err)
//     }
// })()

// (async () => {
//     try {
//         let resourceStake = new AccountResources
//         const [success, status ] = await resourceStake.delegateCpuNet("1.0000", "1.0000")
//         logHandler.info('resourcesStaked: ' + success + "  " + status)
//        }
//     catch (err) {
//         errorHandler('bad delegation', err)
//     }
// })()

// (async () => {
//     try {
//         let resourceStake = new AccountResources
//         const success = await resourceStake.addSYS("1.0000")
//         logHandler.info('resourcesStaked: ' + success)
//        }
//     catch (err) {
//         errorHandler('bad delegation', err)
//     }
// })()