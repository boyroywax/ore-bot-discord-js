import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed, User } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"
import { OreBalance } from "../interfaces/OreChain"
import { OreTreasury } from "../utils/oreTreasury"


export const deposit: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Returns your deposit address" ),
    run: async (interaction) => {
        // 
        // Return the current token price and volume
        // 
        try {       
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: true})

            const discordUser: User = interaction.user

            const treasury = new OreTreasury

            const [ depositaddress, depositQrCode ] = await treasury.getDepositAddress(discordUser)

            const depositEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Deposit Addres")
                .setDescription('Only Send ORE Native tokens to this account.  Do Not send ETH, MATIC, EOS, etc')
                .addField(
                    "Deposit Address",
                    String(depositaddress),
                    false
                )
                .addField(
                    "QR COde",
                    String(depositQrCode),
                    false
                )
    
            await interaction.editReply( {embeds: [depositEmbed]})
        }
        catch (err) {
            errorHandler("/deposit command", err)
        }
        return
    }
}