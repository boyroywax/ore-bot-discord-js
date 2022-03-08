import { HelpersEos } from '@open-rights-exchange/chainjs'
import { User } from "discord.js"
import { AccountType } from 'oreid-js'
import { PrivateKey, PublicKey } from '@open-rights-exchange/chainjs/dist/models'
import { Chain, Transaction } from '@open-rights-exchange/chainjs'
import { TransactionResult } from '@open-rights-exchange/chainjs/src/models'
import { EosNewAccountType, EosAccountStruct } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { EosAccount } from '@open-rights-exchange/chainjs/dist/chains/eos_2'
import { ChainEosV2 } from '@open-rights-exchange/chainjs'
import { toEosAsset, toEosEntityName } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'

import { OreBalanceActions, oreIdActions, OreKeys, OreTreasuryInterface } from "../interfaces/OreChain"
import { createOreConnection } from "../modules/chains"
import { errorHandler } from "../utils/errorHandler"
import { getUser } from "../modules/oreid"
import { logHandler } from './logHandler'


// export async function prepTransaction (chain: Chain | undefined, transaction: Transaction, key: string): Promise<Transaction> {
//     logHandler.info('actions: ' + transaction.actions)
//     await transaction.prepareToBeSigned()
//     await transaction.validate()
//     await transaction.sign([key])
//     if (transaction.missingSignatures) { 
//         logHandler.info('missing sigs: ' + transaction.missingSignatures)
//     }
//     logHandler.info(JSON.stringify(transaction.toJson()))
//     return transaction
//   }

export class OreTreasury implements OreKeys, oreIdActions, OreBalanceActions {
    oreId: string = process.env.BOT_TREASURER_OREID || "ore1sqvihyhs"
    oreBalance: number = 0.00
    pending?: number = 0.00 // Amount of funds pending
    status: string = 'Initiated'
    message: string = 'Hello'
    activePublicKey: PublicKey = process.env.BOT_TREASURER_ACTIVE_PUB_KEY || ''
    activePrivateKey: PrivateKey = process.env.BOT_TREASURER_ACTIVE_PRIV_KEY || ''
    ownerPublicKey: PublicKey = process.env.BOT_TREASURER_OWNER_PUB_KEY || ''
    ownerPrivateKey: PrivateKey = process.env.BOT_TREASURER_OWNER_PRIV_KEY || ''

    public async getBalance(): Promise<number> {
        this.oreBalance = 0.00
        const oreUser: any = this.oreId
        try {
            const oreConnection = await createOreConnection()
            const chainSymbol: string = "ORE"
            const oreBalanceObj = await oreConnection?.fetchBalance(oreUser, HelpersEos.toEosSymbol(chainSymbol))
            this.oreBalance = Number(oreBalanceObj?.balance)
        }
        catch (err) {
            errorHandler("oreTreasury getBalance()", err)
        }
        return this.oreBalance
    }

    public async getDepositAddress(discordUser: User): Promise<[ string, string ] > {
        const address = this.oreId + "-" + discordUser.id
        const qrCode = address
        return [ address, qrCode ]
    }

    public async makeWithdrawl(discordUser: User, amount: number): Promise<[ boolean, string ]> {
        return [ false, '']
    }

    public async createAccount(): Promise<[ boolean, string ]> {
        //
        // Generate's keyset and creates new account on ORE network
        //
        let isSetUp: boolean = false
        let oreId: string = 'None'
        // get a chain object (for an EOS chain using Kylin testnet)

        const oreConnection: Chain | undefined = await createOreConnection()
        const chainSymbol: string = 'ore'

        // new account options
        const accountOptions = {
            accountNamePrefix: HelpersEos.toEosEntityName(chainSymbol),
            creatorAccountName: HelpersEos.toEosEntityName('app.oreid'),
            creatorPermission: HelpersEos.toEosEntityName('active'),
            // publicKeys: {
            //     owner: this.ownerPublicKey,
            //     active: this.activePublicKey
            // },
            newKeysOptions: {
                password: '2233',
                salt: process.env.ORE_TESTNET_ENCRYPTION_SALT
            }
        }

        // get an account creator class
        const accountCreator = await oreConnection?.new.CreateAccount(accountOptions)
        logHandler.info('accountCreator accountType: ' + accountCreator?.accountType)
        // generate the transaction to create an on-chain account
        await accountCreator?.generateKeysIfNeeded()
        logHandler.info('Generated Keys: ' + JSON.stringify(accountCreator?.generatedKeys))

        const supportsCreatAccountTxn = accountCreator?.supportsTransactionToCreateAccount
        logHandler.info("supportsCreatAccountTxn: " + supportsCreatAccountTxn)
        if (supportsCreatAccountTxn) {
            await accountCreator?.composeTransaction(EosNewAccountType.NativeOre)
            // sign and send the transaction to the chain
            // const privateKeyOwner: PrivateKey = this.ownerPrivateKey
            // const privateKeyActive: PrivateKey = this.activePrivateKey
            // await prepTransaction(oreConnection, accountCreator.transaction, process.env.ORE_TESTNET_APPOREID_PRIVATE_KEY || '' )
            logHandler.info(accountCreator.transaction)
            logHandler.info('actions: ' + accountCreator.transaction.actions)
            const key = process.env.ORE_TESTNET_APPOREID_PRIVATE_KEY
            await accountCreator.transaction.prepareToBeSigned()
            await accountCreator.transaction.validate()
            await accountCreator.transaction.sign([key])
            if (accountCreator.transaction.missingSignatures) { 
                logHandler.info('missing sigs: ' + accountCreator.transaction.missingSignatures)
            }
            logHandler.info(JSON.stringify(accountCreator.transaction.toJson()))
            // await accountCreator?.transaction.sign([privateKeyOwner, privateKeyActive])
            const sendStatus: TransactionResult = await accountCreator.transaction.send()
            logHandler.info('sendStatus: ' + JSON.stringify(sendStatus))
        }        
        return [ isSetUp, oreId ]
    }

    public async addPermission(): Promise<string> {
        const permissionNewKeysOptions = {
            password: '2233',
            salt: process.env.ORE_TESTNET_ENCRYPTION_SALT
          }
        const accountNewPermissions = [
            {
              name: HelpersEos.toEosEntityName('buyrambytes'),
              parent: HelpersEos.toEosEntityName('active'),
            },
            {
              name: HelpersEos.toEosEntityName('n2permission'),
              parent: HelpersEos.toEosEntityName('active'),
            }
        ]
        const oreConnection = await createOreConnection()
        const account = (await oreConnection?.new.Account(this.oreId)) as EosAccount
        logHandler.info(this.oreId + ' account permissions:', account.permissions)
        const { generatedKeys, actions } = await account.composeAddPermissionsActions(
            HelpersEos.toEosEntityName('owner'),
            accountNewPermissions,
            permissionNewKeysOptions,
        )
        logHandler.info('generatedKeys:', JSON.stringify(generatedKeys))

        logHandler.info('actions: ' + JSON.stringify(actions))

        const ownerKey = process.env.BOT_TREASURER_OWNER_PRIV_KEY
        // const activeKey = process.env.BOT_TREASURER_ACTIVE_PRIV_KEY
        if (oreConnection) {
            const transaction = await oreConnection.new.Transaction()
            transaction.actions = actions
            await transaction.prepareToBeSigned()
            await transaction.validate()
            await transaction.sign([ownerKey])
            if (transaction.missingSignatures) { 
                logHandler.info('missing sigs: ' + transaction.missingSignatures)
            }
            logHandler.info(JSON.stringify(transaction.toJson()))
            const txResponse = await transaction.send()
            logHandler.info('send response:', JSON.stringify(txResponse))
        }
        return 'Complete'
    }
}
