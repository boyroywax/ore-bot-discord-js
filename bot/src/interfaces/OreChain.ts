import { EosActionStruct } from "@open-rights-exchange/chainjs/dist/chains/eos_2/models";
import { StringMappedInteractionTypes, User } from "discord.js"

// 
// Interfaces for ORE NEtwork Accounts
// 

export interface oreIdData {
    oreId: string
    status?: string
    message?: string
}

export interface oreIdActions extends oreIdData {
    createAccount(): Promise<[ boolean, string ]>
    addPermission(): Promise<string>
}
export interface OreBalance extends oreIdData {
    oreBalance: number
    pending: number  // Amount fo funds pending
}

export interface OreBalanceActions extends OreBalance {
    getBalance(): Promise<number>
}

export interface OreKeys extends oreIdData {
    ownerPublicKey: string 
    ownerPrivateKey: string
    activePublicKey: string
    activePrivateKey: string
}

export interface OreResources extends OreKeys {
    totalCpu?: number
    totalNet?: number
    totalRam?: number
    usedCpu?: number
    usedNet?: number
    usedRam?: number
}

export interface OreResourceActions extends OreResources {
    buyRam(amount: number): Promise< [boolean, string] >
    buyRamBytes(ramBytes: number): Promise< [boolean, string] >
    delegateCpuNet(cpu: string, net: string): Promise< [boolean, string] >
}

export interface OreTreasury extends OreKeys {
    getDepositAddress(discordUser: User): Promise<[string, string]>
    makeWithdrawl(discordUser: User, amount: number): Promise<[boolean, string]>
}

// 
// Interface for an ORE Network Block
// 

export interface OreBlock {
    timestamp: Date
    producer: string
    confirmed: number
    previous: string
    transaction_mroot: string
    action_mroot: string
    schedule_version: number
    new_producers: null
    header_extensions: string[]
    producer_signature: string
    transactions: string[]
    block_extensions: string[]
    id: string
    block_num: number
    ref_block_prefix: string

    getBlock(blockNumber: number): Promise<void>
    getLatestBlock(): Promise<void>
}

// 
// Interface for an ORE Network Transaction
// 

export interface OreTransaction {
    action?: EosActionStruct
    txId: string
    precision: number
    fromUser: string
    chain: string
}

export interface OreSendTransaction extends OreTransaction {
    toUser: string
    amount: number

    createSigningLink(): Promise<[boolean, string, string]>
    createTransactionAction(): Promise<[boolean, string]>
    sendToBlockchain(): Promise<[boolean, string, string]>

}