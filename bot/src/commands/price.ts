import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"

import { getLocalPriceData } from "../utils/priceCheck"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"


export const price: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("price")
        .setDescription("Returns the current  " + process.env.CURRENCY + " price and volume info." ),
    run: async (interaction) => {
        // 
        // Return the current token price and volume
        // 
        try {       
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: false})

            const priceData = await getLocalPriceData()

            const priceEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Price Info")
                .setDescription('Latest ' + process.env.CURRENCY_TOKEN + ' price information')
                .addField(
                    "Price USD",
                    String(priceData.priceUSD) + " USD",
                    false
                )
                .addField(
                    "Volume 24 Hour (USD)",
                    String(priceData.volumeUSD) + " USD",
                    false
                )
                .addField(
                    "Price Change 24 Hour",
                    String(priceData.volumeChange24h),
                    false
                )
            await interaction.editReply( {embeds: [priceEmbed]})
        }
        catch (err) {
            errorHandler("/price command", err)
        }
        return
    }
}