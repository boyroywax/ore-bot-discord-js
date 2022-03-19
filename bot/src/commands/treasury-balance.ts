import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed, User } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"
import { OreTreasury } from "../modules/oreTreasury"


export const treasurybal: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("treasurybal")
        .setDescription("View the Treasury's balance")
        .setDefaultPermission(false),
    run: async (interaction) => {
        // 
        // Return the current teasury balance
        // 
        try {       
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: true })

            const treasury = new OreTreasury
            await treasury.getBalance()

            const balanceEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Treasury Balance")
                .setDescription('Balance treasury account on the ORE Blockchain')
                .addField(
                    "ORE Treasury Balance | " + treasury.oreId,
                    String(treasury.oreBalance),
                    false
                )
                
            await interaction.editReply( {embeds: [balanceEmbed]} )
        }
        catch (err) {
            errorHandler("/treasuryBalance command", err)
        }
        return
    }
}
