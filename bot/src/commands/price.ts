import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorLogger } from "../utils/logHandler"
import { getPrice } from "../serviceCalls/getPrice"
import { PriceData } from "../interfaces/PriceData"


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
            await interaction.deferReply({ ephemeral: false })

            const priceData: PriceData = await getPrice()

            const priceEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Price Info")
                .setDescription('')
                .addField(
                    "Price (USD)",
                    "$" + String(priceData.priceUSD),
                    false
                )
                if (priceData.priceChange24h >= 0.00) {
                    priceEmbed.addField(
                        "Price Change 24 Hour",
                        "⬆ %" + String(priceData.priceChange24h),
                        false
                    )
                }
                else if (priceData.priceChange24h < 0.00) {
                    priceEmbed.addField(
                        "Price Change 24 Hour",
                        "⬇ %" + String(priceData.priceChange24h),
                        false
                    )
                }
                priceEmbed.addField(
                    "Volume 24 Hour (USD)",
                    "$" + String(priceData.volumeUSD),
                    false
                )
            priceEmbed.setFooter(`Price data by CoinGecko`, process.env.COINGECKO_LOGO)

            await interaction.editReply( {embeds: [priceEmbed]})
        }
        catch (err) {
            errorLogger("/price command", err)
        }
        return
    }
}