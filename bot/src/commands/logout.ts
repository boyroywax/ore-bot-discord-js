import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn, setDiscordUserState } from "../modules/mongo"
import { logEntry } from "../modules/userLog"
import { logHandler } from "../utils/logHandler"
import { UserLogKWArgs } from "../interfaces/DiscordUser"


export const logout: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("logout")
        .setDescription("Log out of your ORE-ID account."),
    run: async (interaction) => {
        // 
        // Logout from OreId
        // 

        // Check if user is already logged in and lastLogin Date
        let userCheck = await checkLoggedIn(Number(interaction.user.id))
        .then(async function(response: [boolean, string]) {
            logHandler.info("checkLoggedIn: " + response)

            // Create reply object that only the user can see
            await interaction.deferReply({ ephemeral: true })
            
            // Begin the message embed object
            const loginEmbed = new MessageEmbed()
            loginEmbed.setThumbnail(process.env.OREID_LOGO || 'https://i.imgur.com/A3yS9pl.png')

            // If logged in
            if (response[0] == true) {
                try {
                    // call the api /logout endpoint to fully
                    // logout the user from ORE-ID
                    // await logoutOreId()

                    // Reset the Discord Users State to "None" and
                    // set the loggedIn status to false
                    await setDiscordUserState(
                        Number(interaction.user.id),
                        "None",
                        false
                    )

                    // Create an entry in the user's log
                    const logArgs: UserLogKWArgs = { 
                        status: "Complete"
                    } 
                    await logEntry( "LogOut", Number(interaction.user.id),  logArgs)

                    loginEmbed.setTitle("✅ Success!")
                    loginEmbed.setDescription(
                        "You have been logged out of your ORE-ID account."
                    )
                } catch (err) {
                errorHandler("logout command failed: ", err)
                }
            }
            // else if not logged in
            else {
                loginEmbed.setTitle("⭐️ Surprise")
                loginEmbed.setDescription(
                    "You are already logged out of your ORE-ID account."
                )
            }
            return await interaction.editReply({ embeds: [loginEmbed] })
        })
    }
}