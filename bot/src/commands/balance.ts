import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from "../modules/mongo"
import { logHandler } from "../utils/logHandler"
import { getUser, getOreIdBalance } from "../modules/oreid";
import { unauthorizedCommand } from "../utils/loginCheck";
import { getBotBalance } from "../modules/tipper";

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
                .then(async function([loggedIn, loginDate]: [boolean, string]) {

                // Only display the balance if the user is logged in
                if (loggedIn == true) {
                    // Create a message only the user can see
                    await interaction.deferReply({ ephemeral: true })

                    // Fetch the user's balance on the bot
                    const botBalance: number = await getBotBalance(Number(interaction.user.id))

                    // Fetch the user ORE-ID balance
                    const [ oreIdUserName, oreIdBalance]=  await getOreIdBalance(Number(interaction.user.id))

                    // Construct login embed
                    const balanceEmbed = new MessageEmbed()
                        .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                        .setTitle("💰 Balances")
                        .setDescription("Your " + process.env.CURRENCY + " Balances")
                        .setURL("https://oreid.io")
                        .addField(
                            "🤖 Bot Balance",
                            String(botBalance) + " " + process.env.CURRENCY_TOKEN,
                            false
                        )
                        .addField(
                            "⛅️ ORE-ID Balance | " + oreIdUserName,
                            String(oreIdBalance) + " " + process.env.CURRENCY_TOKEN,
                            false
                        )
                    return await interaction.editReply({ embeds: [balanceEmbed] })
                }
                // Alert the user that they are not logged in
                else {
                    return await unauthorizedCommand(interaction, loginDate)
                }   
            })
        }
        catch (err) {
            errorHandler('/balance command failed', err)
        }
    }
}