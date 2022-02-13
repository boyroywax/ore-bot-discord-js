import { CommandInteraction, MessageEmbed } from "discord.js"
import { errorHandler } from "../utils/errorHandler"


export async function unauthorizedCommand (
    interaction: CommandInteraction,
    lastLogin?: string) {
    try {
        await interaction.deferReply({ ephemeral: true })
        const responseEmbed = new MessageEmbed()
        .setThumbnail(process.env.OREID_LOGO || 'https://i.imgur.com/A3yS9pl.png')

        // Construct login embed and button rows
        responseEmbed.setTitle("⚡️ Please /login")
        responseEmbed.setDescription("You must be logged into ORE-ID to run that command")
        responseEmbed.setURL(process.env.OREID_HOME || "https://oreid.io")
        responseEmbed.addField(
            "Command entered",
            interaction.commandName,
            false
        )
        if (lastLogin) {
            responseEmbed.addField(
                "Last login",
                lastLogin,
                false
            )
        }

        return await interaction.editReply({ embeds: [responseEmbed] })
    } 
    catch (err) {
        errorHandler("Error responding to an unauthorized command", err)
    }
}

export async function alreadyLoggedIn(interaction: CommandInteraction, lastLogin: string) {
    try {
        // Create a message only the user can see
        await interaction.deferReply({ ephemeral: true })

        const responseEmbed = new MessageEmbed()
        .setThumbnail(process.env.OREID_LOGO || 'https://i.imgur.com/A3yS9pl.png')
        .setTitle("👍 Surprise!")
        .setDescription("You are already logged in")
        .setURL(process.env.OREID_HOME || 'https://oreid.io')
        .addField(
            "Last login",
            lastLogin,
            false
        )

        return await interaction.editReply({ embeds: [responseEmbed] })
    } 
    catch (err) {
        errorHandler("Error responding to alreadyLoggedIn", err)
    }
}