import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"

import { getPriceData } from "../modules/priceCheck"
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

            const priceData = await getPriceData()

            const priceEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Price Info")
                .setDescription('')
                .addField(
                    "Price USD",
                    "$" + String(priceData.priceUSD),
                    false
                )
                .addField(
                    "Volume 24 Hour (USD)",
                    "$" + String(priceData.volumeUSD),
                    false
                )
                if (priceData.volumeChange24h >= 0.00) {
                    priceEmbed.addField(
                        "Price Change 24 Hour",
                        "⬆ " + String(priceData.volumeChange24h),
                        false
                    )
                }
                else if (priceData.volumeChange24h < 0.00) {
                    priceEmbed.addField(
                        "Price Change 24 Hour",
                        "⬇ " + String(priceData.volumeChange24h),
                        false
                    )
                }
            await interaction.editReply( {embeds: [priceEmbed]})
        }
        catch (err) {
            errorHandler("/price command", err)
        }
        return
    }
}