import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageEmbed, User } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from '../modules/mongo'
import { doTip } from "../modules/tipper"
import { unauthorizedCommand } from "../utils/loginCheck";
import { logHandler } from "../utils/logHandler";


export const tip: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("tip")
        .setDescription("Tip " + process.env.CURRENCY + " tokens to another user")
        .addUserOption(option => option.setName("recipient").setDescription("Select a user to tip").setRequired(true))
        .addNumberOption(option => option.setName("amount").setDescription("Enter tip amount").setRequired(true)),
    run: async (interaction) => {
        // 
        // 
        // 
        try {
            // Make sure the user is logged in
            let userCheck = await checkLoggedIn(Number(interaction.user.id))
            .then(async function(response: [boolean, string]) {
                if (response[0] == true) {
                    // parse command
                    const recipientUserName = interaction.options.getUser('recipient')
                    const recipient = interaction.options.getUser('recipient')?.id || 0
                    const amount: number = interaction.options.getNumber('amount') || 0.00
                    logHandler.info("message from /tip: " + recipient + " " + amount)
                    const tipResult: [boolean, string] = await doTip(Number(interaction.user.id), Number(recipient), amount) 

                    // Create a message only the user can see
                    await interaction.deferReply({ ephemeral: true })
                    const tipEmbed = new MessageEmbed().setThumbnail(process.env.OREID_LOGO || 'https://i.imgur.com/A3yS9pl.png')

                    if (tipResult[0]) {
                        tipEmbed.setTitle("✅ Tip Complete")
                        tipEmbed.setDescription("Your tip to " + recipientUserName?.toString() + " succeeded!")
                        tipEmbed.addField("Tip Amount", String(amount) + " " + process.env.CURRENCY_TOKEN, false)

                        // Send messages to the sender and recipient
                        await interaction.user.send({embeds: [tipEmbed]})

                        // Create message embed for recipient
                        const recipientEmbed = new MessageEmbed()
                            .setThumbnail(process.env.OREID_LOGO || 'https://i.imgur.com/A3yS9pl.png')
                            .setTitle("🎉 You received a tip!")
                            .setDescription(interaction.user.toString() + " sent you some funds.")
                            .addField("Tip Amount", String(amount) + " " + process.env.CURRENCY_TOKEN, false)
                        

                        await recipientUserName?.send({embeds: [recipientEmbed]})
                    }
                    else {
                        tipEmbed.setTitle("❌ Tip Failed")
                        tipEmbed.setDescription("Your tip to " + recipientUserName?.toString() + " was canceled!")
                        tipEmbed.addField("Tip Amount", String(amount) + " " + process.env.CURRENCY_TOKEN, false)
                        tipEmbed.addField("Reason for failure: ", tipResult[1])
                    }
                    return await interaction.editReply( {embeds: [tipEmbed]})


                }
                else {
                    return await unauthorizedCommand(interaction, response[1])
                }
            })
        }
        catch (err) {
            errorHandler("/tip command failed: ", err)
        }
    }
}