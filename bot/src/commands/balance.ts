import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from "../utils/mongo"
import { logHandler } from "../utils/logHandler"
import { getOreIdBalance } from "../utils/oreid";
import { unauthorizedCommand } from "../utils/loginCheck";
import { getBotBalance } from "../utils/tipper";

export const balance: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your " + process.env.CURRENCY + " balances."),
    run: async (interaction) => {
        // 
        // Displays the bot balance and OreId balance for a user
        // 
        const userDiscordId: bigint = BigInt(interaction.user.id)
        try {
            // Check if user is already logged in and retrive the lastLogin date as a string
            const [ loggedIn, loginDate ] = await checkLoggedIn(userDiscordId)

            // Alert the user that they are not logged in
            if (loggedIn == false) {
                await unauthorizedCommand(interaction, loginDate)
            }   
            // Only display the balance if the user is logged in
            else if (loggedIn == true) {
                // Create a message only the user can see
                await interaction.deferReply({ ephemeral: true })

                // Fetch the user's balance on the bot
                const botBalance: number = await getBotBalance(userDiscordId)

                // Fetch the user ORE-ID balance
                const [ oreIdUserName, oreIdBalance ]=  await getOreIdBalance(userDiscordId)

                // Construct login embed
                const balanceEmbed = new MessageEmbed()
                    .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                    .setTitle("💰 Balances")
                    .setDescription("Your " + process.env.CURRENCY + " Balances")
                    .setURL("https://oreid.io")
                    .addField(
                        "🤖 Balance",
                        String(botBalance) + " " + process.env.CURRENCY_TOKEN,
                        false
                    )
                    .addField(
                        "⛅️ ORE-ID Balance | " + oreIdUserName,
                        String(oreIdBalance) + " " + process.env.CURRENCY_TOKEN,
                        false
                    )
                await interaction.editReply({ embeds: [balanceEmbed] })
            }
        }
        catch (err) {
            errorHandler('/balance command failed', err)
        }
    return
    }
}