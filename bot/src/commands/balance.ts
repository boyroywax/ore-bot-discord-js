import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from "../modules/mongo"
import { logHandler } from "../utils/logHandler"
import { unauthorizedCommand } from "../utils/loginCheck";

export const balance: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your " + process.env.CURRENCY + " balance."),
    run: async (interaction) => {
        // 
        // Displays the bot balance and OreId balance for a user
        // 
        try {
            // Check if user is already logged in and retrive the lastLogin date as a string
            let userCheck = await checkLoggedIn(Number(interaction.user.id))
            .then(async function(response: [boolean, string]) {
                logHandler.info("userCheck for balance: " + response)
                // Only display the balance if the user is logged in
                if (response[0] == true) {
                    // Create a message only the user can see
                    await interaction.deferReply({ ephemeral: true })
                    const balanceEmbed = new MessageEmbed()
                    .setThumbnail(process.env.OREID_LOGO || 'https://i.imgur.com/A3yS9pl.png')

                    // Fetch the user's balance on the bot
                    const botBalance: number = 0

                    // Fetch the user ORE-ID balance
                    const oreIdBalance: number =  0

                    // Construct login embed
                    balanceEmbed.setTitle("💰 Balances")
                    balanceEmbed.setDescription("Your " + process.env.CURRENCY + " Balances")
                    balanceEmbed.setURL("https://oreid.io")
                    balanceEmbed.addField(
                        "🤖 Bot Balance",
                        String(botBalance),
                        true
                    )
                    balanceEmbed.addField(
                        "⛅️ ORE-ID Balance",
                        String(oreIdBalance),
                        true
                    )
                    return await interaction.editReply({ embeds: [balanceEmbed] })
                }
                // Alert the user that they are not logged in
                else {
                    return await unauthorizedCommand(interaction, response[1])
                }   
            })
        }
        catch (err) {
            errorHandler('/balance command failed', err)
        }
    }
}