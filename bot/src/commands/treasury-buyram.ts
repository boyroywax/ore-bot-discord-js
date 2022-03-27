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
        .setDescription("Setup the bot's treasurer account by buying more ram")
        .setDefaultPermission(false)
        .addNumberOption(option => option.setName("amount").setDescription("Enter the amount of RAM you wish to purchase, in bytes.").setRequired(true)),
    run: async (interaction) => {
        // 
        // Add ram to an this on the ORE Blockchain
        // 
        try {       
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: true })

            const amount: number = interaction.options.getNumber('amount') || 0.00
            const treasury = new AccountResources

            // const [ depositaddress, depositQrCode ] = await treasury.getDepositAddress(discordUser)
            const [ success, status ]= await treasury.buyRamBytes(amount)

            const addRamEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Treasury buyRAM")
                .setDescription('Adding RAM resources to the Treasury Account.')
                .addField(
                    "Amount Purchased (Bytes)",
                    String(amount),
                    false
                )
                .addField(
                    "Successful",
                    String(success),
                    false
                )
                .addField(
                    "Transaction Status",
                    String(status),
                    false
                )
    
            await interaction.editReply( {embeds: [addRamEmbed]} )
        }
        catch (err) {
            errorHandler("/buyRam command", err)
        }
        return
    }
}