import { DiscordUser } from "interfaces/DiscordUser"
import { getDiscordUserFromOreId, getDiscordUserFromState } from "./getUser"


export const checkOreIdLink = async(oreIdAttemptingAction: string, state: string): Promise<{available: boolean, oreIdLinked: string}> => {
    let available: boolean = false
    let oreIdLinked: string = "None"
    try {
        const intendedUser = await getDiscordUserFromState(state)
        const currentUser = await getDiscordUserFromOreId(oreIdAttemptingAction)
        // console.log(`currentUser: ${currentUser}`)
        if ( currentUser != null) {
            if (currentUser.discordId !== BigInt(0)) {
                oreIdLinked = intendedUser.oreId || "None"
                console.log(`oreIdLinked ${oreIdLinked}`)
                console.log(`attempting Action ${oreIdAttemptingAction}`)
            }
        }
        if (oreIdLinked === oreIdAttemptingAction ) {
            available = true
        }
        if ((intendedUser.oreId === null) && (currentUser === null)) {
            available = true
        }
        if (oreIdLinked === "None") {
            available=true
        }
    }
    catch (error) {
        console.error("checkOreIdLink failed", error)
        available = true
    }
    console.log(`returned: ${available} ${oreIdLinked}`)
    return ({"available": available, "oreIdLinked":  oreIdLinked})
}
