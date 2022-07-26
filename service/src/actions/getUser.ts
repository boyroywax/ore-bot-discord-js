import { connect, disconnect } from "mongoose"
import { mongoUri } from "../utils/mongo"
import { DiscordUser } from "../interfaces/DiscordUser"
import { DiscordUserModel } from "../models/DiscordUserModel"
import { errorLogger } from "../utils/logHandler"


export const getDiscordUserFromState = async (state: string): Promise<DiscordUser> => {
    let discordUser: DiscordUser = {discordId: BigInt(0)} as DiscordUser
    await connect(mongoUri)
    try {
        discordUser = await DiscordUserModel.findOne({"state": state}) || {discordId: BigInt(0)} as DiscordUser
    }
    catch (err) {
        errorLogger("getDiscordUserFromState", err)
    }
    finally {
        await disconnect()
    }

    return discordUser
}


export const getDiscordUserFromOreId = async (oreId: string): Promise<DiscordUser> => {
    let discordUser: DiscordUser = {discordId: BigInt(0)} as DiscordUser
    await connect(mongoUri)
    try {
        discordUser = await DiscordUserModel.findOne({"oreId": oreId}) || {discordId: BigInt(0)} as DiscordUser
    }
    catch (err) {
        errorLogger("getDiscordUserFromState", err)
    }
    finally {
        await disconnect()
    }

    return discordUser
}

