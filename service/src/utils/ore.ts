import { JsonRpc } from 'eosjs'
import { RequestInfo, RequestInit } from "node-fetch";

const fetch = (url: RequestInfo, init?: RequestInit) =>  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

export class Ore {
    oreEndpoint: { url: string } = {
        url: process.env.CURRENCY_TESTNET + ":443" || "https://ore.openrights.exchange:443"
    }
    rpc: JsonRpc = new JsonRpc( this.oreEndpoint.url )
}

// public async getAccount(accountName: string): Promise<any> {
export const getAccount = async (accountName: string) => {
    try {
        const ore = new Ore()
        const rpc: JsonRpc = new JsonRpc( ore.oreEndpoint.url, {fetch} )
        const accountInfo = await rpc.get_account(accountName)
        return accountInfo
    }
    catch (err) {
        console.error(err)
    }
}

// public async getBalance( accountName: string ): Promise<string> {
export const getBalance = async ( accountName: string ): Promise<string>  => {
    let balance: string = "0.0000"
    try {
        const ore = new Ore()
        const rpc: JsonRpc = new JsonRpc( ore.oreEndpoint.url, {fetch} )
        const balances = await rpc.get_currency_balance('eosio.token', accountName, 'ORE')
        console.log(balances)
        
        if (balances.length !== 0) {
            balance = balances[0]
        }
    }
    catch (err) {
        console.error(err)
    }
    return balance
}

