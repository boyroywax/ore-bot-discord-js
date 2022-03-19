import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"

import { BlockExplorer } from "../modules/blockTools"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"


export const block: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("block")
        .setDescription("Get Live Block Data" ),
    run: async (interaction) => {
        try {
            // create an ephemeral message
            await interaction.deferReply({ ephemeral: true})

            // create a new blockexplorer instance
            let blockExplorer = new BlockExplorer
            await blockExplorer.getLatestBlock()

            const blockEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("Latest ORE Block Info")
                .setDescription('View blocks on the ORE Blockchain')
                .addField(
                    "Block Number",
                    String(blockExplorer.block_num) || "0",
                    true
                )
                .addField(
                    "Confirmed",
                    String(blockExplorer.confirmed) || "0",
                    true
                )
                .addField(
                    "Block Id",
                    String(blockExplorer.id) || "0",
                    false
                )
                .addField(
                    "Timestamp",
                    String(blockExplorer.timestamp.toString()) || "None",
                    false
                )
                .addField(
                    "Transactions",
                    String(blockExplorer.transactions) || 'None',
                    false
                )
    
            await interaction.editReply( {embeds: [blockEmbed]})
        }
        catch (err) {
            errorHandler('/block command', err)
        }
    }
}