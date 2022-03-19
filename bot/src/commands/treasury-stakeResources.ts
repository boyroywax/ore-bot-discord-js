import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed, User } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"
import { OreTreasury } from "../modules/oreTreasury"

export const delegateBW: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("delegatecpunet")
        .setDescription("delegate resorces on the ORE blockchain"),
    run: async (interaction) => {
        // 
        // Create an Accountn on the ORE Blockchain
        // 
        try {       
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: true })

            const treasury = new OreTreasury
            await treasury.getBalance()

            // const [ depositaddress, depositQrCode ] = await treasury.getDepositAddress(discordUser)
            const [ isCompleted, status ] = await treasury.createAccount()

            const accountCreateEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Treasury createAccount")
                .setDescription('Creating a new account on the ORE Blockchain')
                .addField(
                    "Transaction Status | " + isCompleted,
                    String(status),
                    false
                )
    
            await interaction.editReply( {embeds: [accountCreateEmbed]} )
        }
        catch (err) {
            errorHandler("/createAccount command", err)
        }
        return
    }
}
