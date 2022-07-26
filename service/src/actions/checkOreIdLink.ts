import { getDiscordUserFromOreId, getDiscordUserFromState } from "./getUser"


export const checkOreIdLink = async(oreIdAttemptingToLink: string, state: string): Promise<[boolean, string]> => {
    let available: boolean = true
    let oreIdLinked: string = "None"
    try {
        const userToLink = await getDiscordUserFromState(state)
        const userRequestingLink = await getDiscordUserFromOreId(oreIdAttemptingToLink)
        if (userRequestingLink.discordId !== BigInt(0)) {
            available = false
            oreIdLinked = userRequestingLink.oreId || "Unavailable"
        }
        else if (userToLink.oreId === oreIdAttemptingToLink ) {
            available = false
            oreIdLinked = oreIdAttemptingToLink
        }
    }
    catch (error) {

    }
    return [available, oreIdLinked]
}
