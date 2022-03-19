import { EosNewAccountType, EosActionStruct, EosPrivateKey } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { EosAccount, EosTransaction } from '@open-rights-exchange/chainjs/dist/chains/eos_2'
import { toEosAsset, toEosEntityName, toEosPrivateKey, toEosSymbol } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'
import { OreId } from 'oreid-js'

import { precisionRound } from '../utils/tipper'
import { createOreConnection, createSendTransaction } from '../utils/chains'
import { errorHandler } from "../utils/errorHandler"
import { OreSendTransaction, OreTransaction } from "../interfaces/OreChain"
import { validateAddress } from "../utils/transaction"
import { Transaction } from '@open-rights-exchange/chainjs'
import { treasurybal } from 'commands/treasury-balance'
import { OreTreasury } from './oreTreasury'

export class OreTx implements OreSendTransaction {
    toUser: string
    fromUser: string
    amount: number
    action?: EosActionStruct
    txId: string = "None"
    account: string = process.env.CURRENCY_ACCOUNT || 'eosio.token'
    chain: string = process.env.CURRENCY_TOKEN || 'ORE'
    precision: number = Number(process.env.CURRENCY_PRECISION) || 8

    constructor(toUser: string, fromUser: string, amount: number) {
        this.toUser = toUser
        this.fromUser = fromUser
        this.amount = precisionRound( amount, this.precision )
    }

    public async createTransactionAction(): Promise<[boolean, string]> {
        let completed: boolean = false
        let status: string = "Creating the send transaction"
        try {
            // validate the addresses
            const [ toUserIsValid, toUserValidationStatus ] = await validateAddress(this.toUser)
            if (!toUserIsValid) {
                status = "The receiving address is not valid. " + toUserValidationStatus
            }

            const [ fromUserIsValid, fromUserValidationStatus ] = await validateAddress(this.fromUser)
            if (!fromUserIsValid) {
                status += "The sender address is not valid. " + fromUserValidationStatus 
            }

            if (toUserIsValid && fromUserIsValid) {
                const action: EosActionStruct = {
                    account: toEosEntityName(this.account),
                    name: 'transfer',
                    authorization: [
                        {
                            actor: toEosEntityName(this.fromUser),
                            permission: toEosEntityName('active'),
                        },
                    ],
                    data: { 
                        from: toEosEntityName(this.fromUser),
                        to: toEosEntityName(this.toUser),
                        quantity:  toEosAsset(String(this.amount), toEosSymbol(this.chain), ),
                        memo: "Transfer from ORE Community Bot"
                    }
                }
                this.action = action
                completed = true
                status = "Transaction action object created."
            }
        }
        catch (err) {
            errorHandler('createTransactionAction', err)
            status += err
        }
        return [completed, status]
    }

    public async createSigningLink(): Promise<[boolean, string, string]> {
        let completed: boolean = false
        let status: string = "Creating transaction link for signing."
        let signUrl: string = "None"
        try {
            let transaction = await createSendTransaction(this.fromUser, this.toUser, String(this.amount))
            signUrl = String(await transaction?.getSignUrl()) || "None"
            completed = true
            status = "Transaction Link Created"
        }
        catch (err) {
            errorHandler('createSigningLink', err)
            status = String(err)
        }
        
        return [completed, status, signUrl]
    }

    public async sendToBlockchain(): Promise<[boolean, string, string]> {
        let completed: boolean = false
        let status: string = "Sending transaction to the blockchain."
        let TXID: string = "None"
        try {

        }
        catch (err) {
            errorHandler("sendToBlockchain", err)
        }
        
        return [completed, status, TXID]
    }
}