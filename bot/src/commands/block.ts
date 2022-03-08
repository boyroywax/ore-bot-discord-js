import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed, User } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"
import { OreBalance } from "../interfaces/OreChain"
import { OreTreasury } from "../utils/oreTreasury"


export const block: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("block")
        .setDescription("Get Live Block Data" ),
    run: async (interaction) => {
        try {
            
        }
        catch (err) {
            errorHandler('/block command', err)
        }
    }
}