import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { loginUser } from "../modules/oreid"
import { createState } from "../utils/stateTools"
import { checkLoggedIn, setDiscordUserState } from "../modules/mongo"
import { logHandler } from "../utils/logHandler"

export const login: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("login")
        .setDescription("Log into your ORE-ID account."),
    run: async (interaction) => {
        // 
        // Login prompt for OreId
        // 
        const date: Date = new Date

        // Check if user is already logged in
        let userCheck = await checkLoggedIn(Number(interaction.user.id))
        .then(async function(response: [boolean, string]) {

            logHandler.info("userCheck: " + response)
            if (response[0] == true) {
                return await interaction.reply({content: "@" + interaction.user.username +" You are already logged in", ephemeral: true })
            }
            else {
                try {
                    await interaction.deferReply({ ephemeral: true })
                    const loginEmbed = new MessageEmbed()
        
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
        
                    loginEmbed.setTitle("Login to ORE ID")
                    loginEmbed.setDescription(
                        "Login to ORE-ID using a method below."
                    )
                    // loginEmbed.addField(
                    //   "Google Login",
                    //   loginParse.loginUrl
                    // )
                    // ogin Button row 1/2
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
                        loginEmbed.setFooter("Last login: " + response[1])
                    }
        
                    await interaction.editReply({ components: [row, row2], embeds: [loginEmbed] })
                    const userDiscordId: number = Number(interaction.user.id)
    
    
                    await setDiscordUserState(userDiscordId, state)
                    return
                } catch (err) {
                errorHandler("login command", err)
                }
            }   
        })
    }
}