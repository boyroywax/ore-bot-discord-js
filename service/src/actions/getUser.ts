import { connect, disconnect } from "mongoose"
import { convertUserToReturn, mongoUri } from "../utils/mongo"
import { DiscordUser, DiscordUserReturn } from "../interfaces/DiscordUser"
import { DiscordUserModel } from "../models/DiscordUserModel"
import { errorLogger } from "../utils/logHandler"


export const getDiscordUserFromState = async (state: string): Promise<DiscordUserReturn> => {
    let discordUser: DiscordUserReturn = {discordId: "0"} as DiscordUserReturn

    try {
        const result = (await DiscordUserModel.findOne({"state": state})) as DiscordUser
        discordUser = convertUserToReturn(result)
    }
    catch (err) {
        errorLogger("getDiscordUserFromState", err)
    }

    return discordUser
}

export const getDiscordUserFromOreId = async (oreId: string): Promise<DiscordUserReturn> => {
    let discordUser: DiscordUserReturn = {discordId: "0"} as DiscordUserReturn

    try {
        const result = (await DiscordUserModel.findOne({"oreId": oreId})) as DiscordUser
        discordUser = convertUserToReturn(result)
    }
    catch (err) {
        errorLogger("getDiscordUserFromOreId", err)
    }

    return discordUser
}

export const getDiscordUserFromDiscordId = async (discordId: bigint): Promise<DiscordUserReturn> => {
    let discordUser: DiscordUserReturn = {discordId: "0"} as DiscordUserReturn

    try {
        const result = (await DiscordUserModel.findOne({"discordId": discordId})) as DiscordUser
        discordUser = convertUserToReturn(result)
    }
    catch (err) {
        errorLogger("getDiscordUserFromDiscordId", err)
    }

    return discordUser
}

