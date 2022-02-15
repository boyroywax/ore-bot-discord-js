import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { CommandInt } from "../interfaces/CommandInt";
import { errorHandler } from "../utils/errorHandler";

export const help: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Provides information on using this bot."),
  run: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true});
      const helpEmbed = new MessageEmbed()
      helpEmbed.setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
      helpEmbed.setTitle("ORE Network Bot Help")
      helpEmbed.setDescription(
        "Your gateway to the ORE Network Galaxy!"
      )
      helpEmbed.addField(
        "Login to ORE-ID to get started",
        "Use the `/login` command to login to ORE-ID.  If you do not have an account, you will sign up in one easy step."
      )
      helpEmbed.addField(
        "Easily check your balance",
        "Use the `/balance` command to bring up your balances. You have two balances on this system.  Your bot balance represents the coins that are readily spendable (Think of this as your Checking Account). The ORE-ID balance is the token balance of your connected ORE-ID account (Think of this as your Savings Account)."
      )
      helpEmbed.addField(
        "Tip other Discord users",
        "Simply type the `/tip` command to begin the process.  Add the name of the recipient, and the amount to tip (in that order).  Don't sweat it if you can't remember this.  Discord will help you fill out the message."
      )
      helpEmbed.setFooter("Version: " + process.env.VERSION, process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
      await interaction.editReply({ embeds: [helpEmbed] })
      return
    } catch (err) {
      errorHandler("help command", err)
    }
  },
};