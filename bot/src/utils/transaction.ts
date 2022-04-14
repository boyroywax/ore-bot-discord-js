import { EosActionStruct, EosPrivateKey } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { EosTransaction } from '@open-rights-exchange/chainjs/dist/chains/eos_2'
import { isValidEosEntityName , toEosSymbol, toEosEntityName} from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'

import { logHandler } from "./logHandler"
import { createOreConnection } from "./chains"
import { errorHandler } from './errorHandler'
import { getBotBalance, precisionRound } from './tipper'
import { OreTreasury } from '../modules/oreTreasury'
import { getOreIdUser, setDiscordUserState, updateBotBalance } from './mongo'
import { OreTx } from '../modules/oreTransaction'
import { createState } from './stateTools'


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

export function verifyBalance ( userAmountRequested: number, balance: number): [boolean, string] {
    let completed = false
    let status = "Initiating verifyBalance"
    
    if ( userAmountRequested == 0.00 ) {
        status = "Zero is not a valid value."
    }
    else if ( userAmountRequested < 0.00 ) {
        status = "Amount cannot be negative."
    }
    else if ( userAmountRequested > balance ) {
        status = "Amount exceeds current balance."
    }
    else if ( userAmountRequested <= balance ){
        completed = true
        status = 'The Amount is within the current balance.'
    }

    return [completed, status]
}

export async function verifyBotBalance( discordUser: bigint, amount: number ): Promise<[ boolean, string, number ]> {
    let completed: boolean = false
    let status: string = "Initiating Verification of bot balance."
    const userBotBalance: number = await getBotBalance(discordUser);

    [ completed, status ] = verifyBalance(amount, userBotBalance)

    return [completed, status, userBotBalance]
}

export async function verifyOreIdBalance( oreId: string, amount: number ): Promise<[ boolean, string, number ]> {
    let completed: boolean = false
    let status: string = "Initiating Verification of OreId balance"
    let userOreIdBalance: number = 0.00

    try {
        const oreConnection = await createOreConnection()
        const chainSymbol: string = "ORE"
        const oreBalanceObj = await oreConnection?.fetchBalance(toEosEntityName(oreId), toEosSymbol(chainSymbol))
        userOreIdBalance = Number(oreBalanceObj?.balance);

        [ completed, status ] = verifyBalance(amount, userOreIdBalance)
    }
    catch (err) {
        errorHandler('verifyOreIdBalance', err)
        status = "Verification of OreId balance failed!"
    }

    
    return [completed, status, userOreIdBalance]
}

export async function transferFunds(discordUser: bigint, amount: number, destination: string): Promise<[boolean, string]> {
    let completed: boolean = false
    let status: string = "Initiating funds transfer"
    try {
        // Transfer funds to personal ORE-ID Account from the treasury
        // first check the user's Active Account Balance
        if (destination == "oreid" ) {
            const [verified, verificationStatus, activeBalance] = await verifyBotBalance(discordUser, amount)
            if (!verified) {
                status = verificationStatus
            }
            else {
                // Get the OreTreasury's balance and verify the amount
                const oreTreasury = new OreTreasury
                let treasuryBalance = await oreTreasury.getBalance()
                const [balanceVerified, balanceStatus] = verifyBalance(amount, treasuryBalance)
                if (!balanceVerified) {
                    status = balanceStatus
                }
                else {
                    // get the user's active balance
                    const [activeBalanceVerified, activeBalanceStatus, activeBalance] = await verifyBotBalance(discordUser, amount)
                    // decrease the user's Active balance
                    const activeBalanceUpdate: number = precisionRound(activeBalance - amount, 8  )
                    const activeBalanceUpdateStatus: boolean =  await updateBotBalance(discordUser, activeBalanceUpdate)

                    if (!activeBalanceUpdateStatus) {
                        status = 'updateBalance in DB failed'
                    }
                    else {
                        // Check that the user has an OreId account
                        const userOreId = await getOreIdUser(discordUser)
                        if (!userOreId) {
                            status = "User not found in DB"
                        }
                        else {
                            // transfer the transferAmount from the Treasury into the user's ORE-ID Balance
                            const [ withdrawComplete, withdrawStatus ] = await oreTreasury.makeWithdrawl(amount, userOreId)
                            if (!withdrawComplete) {
                                status = withdrawStatus
                            }
                            else {
                                completed = true
                                status = "Funds Successfully Transferred!"
                            }
                        }
                    }
                }
            }
        }
        else if (destination == "active") {
            // Transfer funds to Active Account
            // get the user's ore-id account name
            const oreIdAccount: string = await getOreIdUser(discordUser)

            // get the user's ore-id account balance
            const [fundVerified, fundStatus] = await verifyOreIdBalance(oreIdAccount, amount)

            if (!fundVerified) {
                status = fundStatus
            }
            else {
                // verify funds in Treasury Account
                let oreTreasury = new OreTreasury
                const vaultBalance = await oreTreasury.getBalance()
                const [treasuryVerified, treasuryStatus] = verifyBalance(amount, vaultBalance)
                if (!treasuryVerified) {
                    status = treasuryStatus
                }
                else {
                    // create a pending transaction in the DiscordUser Log
                    const currentDate: Date = new Date
                    const state: string = createState(currentDate)
                    const stateSet = await setDiscordUserState( discordUser, state, true, amount )
    
                    if (!stateSet) {
                        status = "Setting user state in DB failed."
                    }
                    else {
                        const treasuryAddress: string = process.env.BOT_TREASURER_OREID || ""
                        let transaction: OreTx = new OreTx( treasuryAddress, oreIdAccount, amount )
                        let[ signUrlCreated, signUrlStatus, signUrl ] = await transaction.createSigningLink()
                        if (!signUrlCreated) {
                            status = signUrlStatus
                        } 
                        else {
                            signUrl = signUrl + "&state=" + state
                            completed = true
                            status = signUrl
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        errorHandler('transferFunds', err)
    }
    return [ completed, status ]
}