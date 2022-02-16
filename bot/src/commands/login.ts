import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { loginUser } from "../modules/oreid"
import { createState } from "../utils/stateTools"
import { checkLoggedIn, setDiscordUserState } from "../modules/mongo"
import { logHandler } from "../utils/logHandler"
import { alreadyLoggedIn } from "../utils/loginCheck"
import { logEntry } from "../modules/userLog"
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
        try {
            // Check if user is already logged in
            let userCheck = await checkLoggedIn(Number(interaction.user.id))
            .then(async function(response: [boolean, string]) {
                logHandler.info("userCheck: " + response)
                
                // Alert the user if they are already logged in
                if (response[0] == true) {
                    return await alreadyLoggedIn(interaction, response[1])
                }
                // Present the login menu if the user is not logged in
                else {
                    // Create a message only the user can see
                    await interaction.deferReply({ ephemeral: true })
                    const loginEmbed = new MessageEmbed()
                    .setThumbnail(process.env.OREID_LOGO || 'https://i.imgur.com/A3yS9pl.png')
                    
                    // Create State from date
                    const state: string = createState(date)
        
                    // Create Google Login Link
                    let googleLoginInfo: string = await loginUser("google", state) || ""
                    let googleLoginParse = JSON.parse(googleLoginInfo)
        
                    // Create Facebook Login Link
                    let facebookLoginInfo: string = await loginUser("facebook", state) || ""
                    let facebookLoginParse = JSON.parse(facebookLoginInfo)
        
                    // Create Email Login Link
                    let emailLoginInfo: string = await loginUser("email", state) || ""
                    let emailLoginParse = JSON.parse(emailLoginInfo)
        
                    // Create SMS Login Link
                    let phoneLoginInfo: string = await loginUser("sms", state) || ""
                    let phoneLoginParse = JSON.parse(phoneLoginInfo)

                    // Construct login embed and button rows
                    // loginEmbed.setTitle("<:emoji name:oreidlogo:> Login to ORE ID") BROKEN
                    loginEmbed.setTitle("Login to ORE ID")
                    loginEmbed.setDescription("Login to ORE-ID using a method below.")
                    loginEmbed.setURL(process.env.OREID_HOME || "https://oreid.io")
                    loginEmbed.addField(
                        "Last login",
                        response[1] || "Never",
                        false
                    )

                    // Login Button row 1/2
                    const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Google')
                        .setURL(googleLoginParse.loginUrl)
                        .setStyle('LINK')
                    )
                    .addComponents(
                        new MessageButton()
                        .setLabel('Facebook')
                        .setURL(facebookLoginParse.loginUrl)
                        .setStyle('LINK')
                    )
                    // Login Button Row 2/2
                    const row2 = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Email')
                        .setURL(emailLoginParse.loginUrl)
                        .setStyle('LINK')
                    )
                    .addComponents(
                        new MessageButton()
                        .setLabel('Phone')
                        .setURL(phoneLoginParse.loginUrl)
                        .setStyle('LINK')
                    )
                    if (response[1] != "None") {
                        loginEmbed.addField,
                        "Last login",
                        response[1]
                    }
                    // Send the embed to discord
                    await interaction.editReply({ components: [row, row2], embeds: [loginEmbed] })
                    
                    const userDiscordId: number = Number(interaction.user.id)
                    await setDiscordUserState(userDiscordId, state)
                    
                    const logArgs: UserLogKWArgs = { 
                        stage: "Initiated"
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