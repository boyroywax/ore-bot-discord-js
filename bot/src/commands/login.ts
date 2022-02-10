import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { loginUser } from "../modules/oreid"
import { setUserState } from "../utils/stateCall"

export const login: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("login")
    .setDescription("Log into your ORE-ID account."),
  run: async (interaction) => {
    try {
      await interaction.deferReply()
      const loginEmbed = new MessageEmbed()

      // Create Google Login Link
      let googleLoginInfo: string = await loginUser("google") || ""
      let googleLoginParse = JSON.parse(googleLoginInfo)

      // Create Facebook Login Link
      let facebookLoginInfo: string = await loginUser("facebook") || ""
      let facebookLoginParse = JSON.parse(facebookLoginInfo)

      // Create Email Login Link
      let emailLoginInfo: string = await loginUser("email") || ""
      let emailLoginParse = JSON.parse(emailLoginInfo)

      // Create SMS Login Link
      let phoneLoginInfo: string = await loginUser("sms") || ""
      let phoneLoginParse = JSON.parse(phoneLoginInfo)

      loginEmbed.setTitle("Login to ORE ID")
      loginEmbed.setDescription(
        "Login to ORE-ID using a method below."
      )
      // loginEmbed.addField(
      //   "Google Login",
      //   loginParse.loginUrl
      // )
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

		  await interaction.editReply({ components: [row, row2], embeds: [loginEmbed] })
      
      const userDiscordId: string = interaction.user.id
      await setUserState(userDiscordId)
      return
    } catch (err) {
      errorHandler("login command", err)
    }
  },
};