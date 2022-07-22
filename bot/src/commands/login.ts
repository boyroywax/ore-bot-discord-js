import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { loginUser } from "../utils/oreid"
import { createState } from "../utils/stateTools"
import { checkLoggedIn, setDiscordUserState } from "../utils/mongo"
import { logHandler } from "../utils/logHandler"
import { alreadyLoggedIn } from "../utils/loginCheck"
import { logEntry } from "../utils/userLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"

export const login: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("login")
        .setDescription("Log into your ORE-ID account."),
    run: async (interaction) => {
        // 
        // Login prompt for OreId
        // 
        const date: Date = new Date
        const userDiscordId: bigint = BigInt(interaction.user.id)
        try {
            // Check if user is already logged in
            await checkLoggedIn(userDiscordId)
                .then(async function([loggedIn, loginDate]: [boolean, string]) {
                
                // Alert the user if they are already logged in
                if (loggedIn == true) {
                    return await alreadyLoggedIn(interaction, loginDate)
                }
                // Present the login menu if the user is not logged in
                else {
                    // Create a message only the user can see
                    await interaction.deferReply({ ephemeral: true })
                    const loginEmbed = new MessageEmbed()
                        .setThumbnail(process.env.OREID_LOGO || 'https://i.imgur.com/A3yS9pl.png')
                    
                    // Create State from date
                    const state: string = createState(date)
                    const loginUrl: string = process.env.OREID_PORTAL_URL + '/login?state=' + state
        

                    // Construct login embed and button rows
                    loginEmbed.setTitle("Login to ORE ID")
                    loginEmbed.setDescription("Cllick the button below!")
                    loginEmbed.setURL(process.env.OREID_HOME || "https://oreid.io")
                    loginEmbed.addField(
                        "Last login",
                        loginDate || "Never",
                        false
                    )

                    // Login Button row 
                    const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Login Now')
                        .setURL(loginUrl)
                        .setStyle('LINK')
                    )
                    
                    // Send the embed to discord
                    await interaction.editReply({ components: [row ], embeds: [loginEmbed] })
                    
                    await setDiscordUserState(userDiscordId, state)
                    
                    const logArgs: UserLogKWArgs = { 
                        status: "Initiated"
                    } 
                    const savedLogEntry = await logEntry( "Login", userDiscordId, logArgs )
                    logHandler.info("Log entry saved?: " + savedLogEntry)
                    return
                }
            })
        } catch (err) {
            errorHandler("/login command error", err)
        }
    }
}