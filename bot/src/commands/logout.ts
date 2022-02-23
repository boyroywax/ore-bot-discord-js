import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn, setDiscordUserState } from "../modules/mongo"
import { logEntry } from "../modules/userLog"
import { logHandler } from "../utils/logHandler"
import { UserLogKWArgs } from "../interfaces/DiscordUser"
import { logoutUserAddress } from "../modules/oreid"
import { createState } from "../utils/stateTools"


export const logout: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("logout")
        .setDescription("Log out of your ORE-ID account."),
    run: async (interaction) => {
        // 
        // Logout from OreId Prompt
        // 
        let userCheck = await checkLoggedIn(Number(interaction.user.id))
            .then(async function([loggedIn, loginDate]: [boolean, string]) {
            logHandler.info("checkLoggedIn: " + loggedIn)

            // Create reply object that only the user can see
            await interaction.deferReply({ ephemeral: true })
            
            // Begin the message embed object
            const logoutEmbed = new MessageEmbed()
                .setThumbnail(process.env.OREID_LOGO || 'https://i.imgur.com/A3yS9pl.png')

            const date: Date = new Date
            // If logged in
            if (loggedIn == true) {
                try {
                    // call the api /logout endpoint to fully
                    // logout the user from ORE-ID
                    // await logoutUser()

                    const state: string = createState(date)

                    // Reset the Discord Users State to "None" and
                    // set the loggedIn status to false
                    await setDiscordUserState(
                        Number(interaction.user.id),
                        state,
                        true
                    )

                    // Create an entry in the user's log
                    const logArgs: UserLogKWArgs = { 
                        status: "Initiated"
                    } 
                    await logEntry( "LogOut", Number(interaction.user.id),  logArgs)

                    logoutEmbed.setTitle("🪵 Logout Started!")
                    logoutEmbed.setDescription(
                        "Click below to be logged out of your ORE-ID account."
                    )
                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                            .setLabel('Log Out')
                            .setURL(logoutUserAddress(state))
                            .setStyle('LINK')
                        )
                    await interaction.editReply({ components: [row], embeds: [logoutEmbed] })
                } catch (err) {
                errorHandler("logout command failed: ", err)
                }
            }
            // else if not logged in
            else {
                logoutEmbed.setTitle("⭐️ Surprise")
                logoutEmbed.setDescription(
                    "You are already logged out of your ORE-ID account."
                )
                await interaction.editReply({ embeds: [logoutEmbed] })
            }
            return 
        })
    }
}