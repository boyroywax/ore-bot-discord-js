import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";
import { loginUser } from "../modules/oreid"

export const login: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("login")
    .setDescription("Log into your ORE-ID account."),
  run: async (interaction) => {
    try {
      await interaction.deferReply()
      const loginEmbed = new MessageEmbed()
      let loginInfo: string = await loginUser() || ""
      let loginParse = JSON.parse(loginInfo)
      loginEmbed.setTitle("Login With Google")
      loginEmbed.setDescription(
        "Login to ORE-ID using your Google Account."
      )
      loginEmbed.addField(
        "Google Login",
        loginParse.loginUrl
      )
      await interaction.editReply({ embeds: [loginEmbed] })
      return;
    } catch (err) {
      errorHandler("login command", err);
    }
    const helpEmbed = new MessageEmbed();
      helpEmbed.setTitle("100 Days of Code Bot!");
      helpEmbed.setDescription(
        "This discord bot is designed to help you track and share your 100 Days of Code progress."
      );
      helpEmbed.addField(
        "Create today's update",
        "Use the `/100` command to create your update for today. The `message` will be displayed in your embed."
      );
      helpEmbed.addField(
        "Edit today's update",
        "Do you see a typo in your embed? Right click it and copy the ID (you may need developer mode on for this), and use the `/edit` command to update that embed with a new message."
      );
      helpEmbed.addField(
        "Show your progress",
        "To see your current progress in the challenge, and the day you last checked in, use `/view`."
      );
      helpEmbed.setFooter(`Version ${process.env.npm_package_version}`);
      await interaction.editReply({ embeds: [helpEmbed] });
      return;
  },
};