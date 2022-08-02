import { getTips } from "../serviceCalls/getTips"
import { getActivity } from "../serviceCalls/getActivity"
import { getBalances } from "../serviceCalls/getBalances"
import { getUser } from "../serviceCalls/getUser"

export class DiscordUserData {
    discordId: bigint = BigInt(0)
    accountName: string = "none"
    activeBalance: number = 0.0000
    oreIdBalance: number = 0.0000
    logEntries: any[] = []
    tipCount: number = 0

    constructor(user: any) {
        this.accountName = user.accountName
    }

    private loadDiscordId = async () => {
        const userData = await getUser(this.accountName, "oreid")
        if (userData.discordId) {
            this.discordId = userData.discordId
        }
    }

    private loadUserBalances = async () => {
        const balance = await getBalances(this.discordId)
        this.activeBalance = Number(balance.activeBalance)
        this.oreIdBalance = Number(balance.oreIdBalance)
    }

    private loadLogEntries = async () => {
        const logEntries = await getActivity(this.discordId)
        this.logEntries = logEntries
    } 
    
    private loadUserTips = async () => {
        const userTotalTips = await getTips(this.discordId, "total")
        this.tipCount = userTotalTips.result
    }

    public loadUserData = async () => {
    //     await this.loadDiscordId()
    //         .then( async () => {
    //             await this.loadUserBalances()
    //                 .then( async () => {
    //                     await this.loadUserTips()
    //                         .then( async() => {
    //                           await this.loadLogEntries()  
    //                         })
    //                 })
    //         })
    // }
        await this.loadDiscordId()
        .then( async () => {
            await this.loadUserBalances()
            await this.loadUserTips()
            await this.loadLogEntries()
        })
    }

}