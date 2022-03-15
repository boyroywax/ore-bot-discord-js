import { EosActionStruct, EosPrivateKey } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { EosTransaction } from '@open-rights-exchange/chainjs/dist/chains/eos_2'
import { isValidEosEntityName } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'

import { logHandler } from "./logHandler"
import { createOreConnection } from "../modules/chains"
import { errorHandler } from './errorHandler'

export async function executeTxn(action: EosActionStruct[], key: EosPrivateKey[]): Promise<[boolean, string]> {
    let completed: boolean = false
    let status: string = "executeTxn initiating."
    const oreConnection = await createOreConnection()
    logHandler.info('ore status: ' + JSON.stringify(oreConnection))

    if (oreConnection) {
        const transaction: EosTransaction = (await oreConnection.new.Transaction()) as EosTransaction
        if (transaction) {
            transaction.actions = action
            await transaction.prepareToBeSigned()
            await transaction.validate()
            await transaction.sign(key)
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
    status = "executeTxn Failed"
    return [completed, status]
}

export async function validateAddress(address: string): Promise<[ boolean, string ]> {
    let completed: boolean = false
    let status: string = "Validating Send Transaction"
    try {
        // check that the address is valid
        const validAddress: boolean = isValidEosEntityName(address)
        logHandler.info('is validAddress: ' + validAddress)
        if (validAddress) {
            completed = true
            status = address + " is a valid " + process.env.CURRENCY_TOKEN + " address."
        }
        else {
            status = address + " is NOT a valid " + process.env.CURRENCY_TOKEN + " address."
        }
    }
    catch (err) {
        errorHandler("validateSendTxn", err)
    }

    return [completed, status]
}