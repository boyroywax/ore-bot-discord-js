import { DiscordUser } from "../interfaces/DiscordUser"
import { getDiscordUserFromOreId, getDiscordUserFromState } from "./getUser"


export const checkOreIdLink = async(oreIdAttemptingAction: string, state: string): Promise<{available: boolean, oreIdLinked: string}> => {
    let available: boolean = false
    let oreIdLinked: string = "None"
    try {
        const intendedUser: DiscordUser = await getDiscordUserFromState(state)
        // const currentUser: DiscordUser = await getDiscordUserFromOreId(oreIdAttemptingAction)
        // console.log(`currentUser: ${currentUser}`)

        oreIdLinked = intendedUser.oreId || "None"
        console.log(`oreIdLinked ${oreIdLinked}`)
        console.log(`attempting Action ${oreIdAttemptingAction}`)

        if (oreIdLinked === oreIdAttemptingAction ) {
            available = true
        }
    }
    catch (error) {
        console.error("checkOreIdLink failed", error)
    }
    console.log(`returned: ${available} ${oreIdLinked}`)
    return ({"available": available, "oreIdLinked":  oreIdLinked})
}
