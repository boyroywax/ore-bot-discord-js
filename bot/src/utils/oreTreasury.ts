import { HelpersEos } from '@open-rights-exchange/chainjs'
import { User } from "discord.js"
import { AccountType, AddPermissionParams, UserPermission } from 'oreid-js'
import { PrivateKey, PublicKey } from '@open-rights-exchange/chainjs/dist/models'
import { Chain } from '@open-rights-exchange/chainjs'
import { TransactionResult } from '@open-rights-exchange/chainjs/src/models'
import { EosNewAccountType, EosActionStruct, EosPrivateKey } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'
import { EosAccount } from '@open-rights-exchange/chainjs/dist/chains/eos_2'
import { toEosAsset, toEosEntityName, toEosPrivateKey, toEosSymbol } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'

import { OreBalanceActions, oreIdActions, OreKeys } from "../interfaces/OreChain"
import { createOreConnection } from "../modules/chains"
import { errorHandler } from "../utils/errorHandler"
import { DiscordUser } from '../interfaces/DiscordUser'
import { logHandler } from './logHandler'
import { executeTxn } from './transaction'


export class OreTreasury implements OreKeys, oreIdActions, OreBalanceActions {
    oreId: string = process.env.BOT_TREASURER_OREID || "ore1sqvihyhs"
    oreBalance: number = 0.00
    pending: number = 0.00 // Amount of funds pending
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

    public async makeWithdrawl(amount: number, toAddress: string): Promise<[ boolean, string ]> {
        let completed: boolean = false
        let status: string = "Withdrawl initiated."
        const resources: EosActionStruct = {
            account: toEosEntityName('eosio.token'),
            name: 'transfer',
            authorization: [
                {
                    actor: toEosEntityName(this.oreId),
                    permission: toEosEntityName('active'),
                },
            ],
            data: { 
                from: toEosEntityName(this.oreId),
                to: toEosEntityName(toAddress),
                quantity:  toEosAsset(String(amount), toEosSymbol('ORE'), 4),
                memo: "Transfer from ORE Community Bot"
            }
        };
        [completed, status] = await executeTxn([resources], [this.activePrivateKey])

        return [completed, status]
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

        const ownerKey: EosPrivateKey = toEosPrivateKey(process.env.BOT_TREASURER_OWNER_PRIV_KEY || '')
        await executeTxn(actions, [ownerKey])
        return 'Complete'
    }
}
