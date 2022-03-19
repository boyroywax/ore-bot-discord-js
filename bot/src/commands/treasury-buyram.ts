import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed, User } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"
import { OreTreasury } from "../modules/oreTreasury"
import { AccountResources } from "../modules/accountResources"


export const buyRamByte: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("buyrambytes")
        .setDescription("Setup the bot's treasurer account by buying more ram"),
    run: async (interaction) => {
        // 
        // Add ram to an this on the ORE Blockchain
        // 
        try {       
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: true })

            const treasury = new AccountResources

            // const [ depositaddress, depositQrCode ] = await treasury.getDepositAddress(discordUser)
            await treasury.buyRamBytes(9182)

            const addRamEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Treasury buyRAM")
                .setDescription('Add ram to an account on the ORE Blockchain')
                // .addField(
                //     "Transaction ID",
                //     String(txid),
                //     false
                // )
    
            await interaction.editReply( {embeds: [addRamEmbed]} )
        }
        catch (err) {
            errorHandler("/buyRam command", err)
        }
        return
    }
}