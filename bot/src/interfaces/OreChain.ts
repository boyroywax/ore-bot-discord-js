import { User } from "discord.js"

// 
// Interface for ORE Balance
// 

export interface oreId {
    oreId: string
    status?: string
    message?: string
}

export interface oreIdActions extends oreId {
    createAccount(): Promise<[ boolean, string ]>
    addPermission(): Promise<string>
}
export interface OreBalance extends oreId {
    oreBalance: number
    pending: number  // Amount fo funds pending
}

export interface OreBalanceActions {
    getBalance(): Promise<number>
}

export interface OreKeys extends oreId {
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
    delegateCpuNet(cpu: number, net: number): Promise< [boolean, string] >
}

export interface OreTreasuryInterface extends OreKeys {
    getDepositAddress(discordUser: User): Promise<[string, string]>
    makeWithdrawl(discordUser: User, amount: number): Promise<[boolean, string]>
}




// 
// Interface for an ORE Network Block
// 

// 
// Interface for an ORE Network Transaction
// 