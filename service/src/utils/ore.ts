import { JsonRpc } from 'eosjs'

export class Ore {
    oreEndpoint: { url: string } = {
        url: process.env.CURRENCY_MAINNET || "https://ore.openrights.exchange"
    }
    rpc: JsonRpc = new JsonRpc( this.oreEndpoint.url )

    public async getAccount(accountName: string): Promise<any> {
        try {
            const accountInfo = await this.rpc.get_account(accountName)
            return accountInfo
        }
        catch (err) {
            console.error(err)
        }
    }

    public async getBalance( accountName: string ): Promise<string> {
        let balance: string = "0.0000 ORE"
        try {
            const balances = await this.rpc.get_currency_balance('eosio.token', accountName, 'ORE')
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
}
