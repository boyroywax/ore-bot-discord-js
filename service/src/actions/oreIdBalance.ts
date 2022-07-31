import { getBalance } from '../utils/ore'
import { debugLogger, errorLogger } from '../utils/logHandler'
import { getDiscordUserFromDiscordId } from './getUser'
import { DiscordUser } from '../interfaces/DiscordUser'


export async function getOreIdBalance( discordId: bigint ): Promise<{ oreIdAccountName: string, oreIdBalance: string}> {
    // 
    // Returns a discord user's ORE-id account name and ORE Netowrk blockchain balance
    // 
    // const ore = new Ore()
    let oreIdAccountName: string = "None"
    let oreIdBalance: string = "0.0000"
    try{
        const discordUser: DiscordUser = await getDiscordUserFromDiscordId( discordId )
        oreIdAccountName = discordUser.oreId || ""
        oreIdBalance = await getBalance( oreIdAccountName )
        debugLogger("oreIdAccountName: " + oreIdAccountName + " oreIdBalance: " + oreIdBalance)
        
    } catch (err) {
        errorLogger('getOreIdBalance', err)
    }
    return { "oreIdAccountName": oreIdAccountName, "oreIdBalance": oreIdBalance.split(' ')[0] }
}