import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn, setDiscordUserState } from "../modules/mongo"
import { logHandler } from "../utils/logHandler"
import { set } from "mongoose";
import { login } from "./login";

export const logout: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("logout")
        .setDescription("Log out of your ORE-ID account."),
    run: async (interaction) => {
        // 
        // Logout from OreId
        // 

        // Check if user is already logged in
        let userCheck = await checkLoggedIn(Number(interaction.user.id))
        .then(async function(response: [boolean, string]) {
            logHandler.info("userCheck: " + response)
            await interaction.deferReply({ ephemeral: true })
            const loginEmbed = new MessageEmbed()
            if (response[0] == true) {
                try {
                    await setDiscordUserState(
                        Number(interaction.user.id),
                        "None",
                        false
                    )
                    loginEmbed.setThumbnail('https://i.imgur.com/A3yS9pl.png')
                    loginEmbed.setTitle("✅ Succes")
                    loginEmbed.setDescription(
                        "You have been logged out your ORE-ID account."
                    )
                } catch (err) {
                errorHandler("logout command failed: ", err)
                }
            }
            else {
                loginEmbed.setThumbnail('https://i.imgur.com/A3yS9pl.png')
                loginEmbed.setTitle("⭐️ Sorry")
                loginEmbed.setDescription(
                    "You are already logged out of your ORE-ID account."
                )
            }
            return await interaction.editReply({ embeds: [loginEmbed] })
        })
    }
}