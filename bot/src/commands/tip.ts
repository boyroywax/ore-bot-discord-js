import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, User } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from '../modules/mongo'
import { doTip } from "../modules/tipper"
import { unauthorizedCommand } from "../utils/loginCheck";
import { logHandler } from "../utils/logHandler";
import { logEntry } from "../modules/userLog";
import { UserLogKWArgs } from "../interfaces/DiscordUser";


export const tip: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("tip")
        .setDescription("Tip " + process.env.CURRENCY + " tokens to another user")
        .addUserOption(option => option.setName("recipient").setDescription("Select a user to tip").setRequired(true))
        .addNumberOption(option => option.setName("amount").setDescription("Enter tip amount").setRequired(true)),
    run: async (interaction) => {
        // 
        // Tip another user some tokens from your bot account
        // 
        try {
            // Make sure the user is logged in
            let userCheck = await checkLoggedIn(Number(interaction.user.id))
            .then(async function(response: [boolean, string]) {
                if (response[0] == true) {
                    // parse incoming command
                    const recipientUserName = interaction.options.getUser('recipient')
                    const recipient = interaction.options.getUser('recipient')?.id || 0
                    const amount: number = interaction.options.getNumber('amount') || 0.00
                    // logHandler.info("Command MSG /tip - from: " + recipient + " for: " + amount)
                    const tipResult: [boolean, string] = await doTip(Number(interaction.user.id), Number(recipient), amount) 

                    // Create a message only the user can see
                    await interaction.deferReply({ ephemeral: true })
                    const tipEmbed = new MessageEmbed().setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')

                    // If the tip was successful
                    if (tipResult[0]) {
                        tipEmbed.setTitle("✅ Tip Complete")
                        tipEmbed.setDescription("Your tip to " + recipientUserName?.toString() + " succeeded!")
                        tipEmbed.addField("Tip Amount", String(amount) + " " + process.env.CURRENCY_TOKEN, false)

                        // Send PM to the sender of the tip
                        await interaction.user.send({embeds: [tipEmbed]})

                        // Create message embed for recipient
                        const recipientEmbed = new MessageEmbed()
                            .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                            .setTitle("🎉 You received a tip!")
                            .setDescription(interaction.user.toString() + " sent you some funds.")
                            .addField("Tip Amount", String(amount) + " " + process.env.CURRENCY_TOKEN, false)
                        
                        // Send PM to receiver of the tip
                        await recipientUserName?.send({embeds: [recipientEmbed]})

                        // Compose User's log entry for a succesfull tip
                        const logArgs: UserLogKWArgs = { 
                            recipient: Number(recipient),
                            amount: amount,
                            stage: "Complete"
                        } 
                        const tipLogSuccess = await logEntry( "Tip", Number(interaction.user.id), logArgs )
                        // logHandler.info("tipLogSuccess: " + tipLogSuccess)
                    }
                    // The tip was unsuccessful
                    else {
                        tipEmbed.setTitle("❌ Tip Failed")
                        tipEmbed.setDescription("Your tip to " + recipientUserName?.toString() + " was canceled!")
                        tipEmbed.addField("Tip Amount", String(amount) + " " + process.env.CURRENCY_TOKEN, false)
                        tipEmbed.addField("Reason for failure: ", tipResult[1])

                        // compose User's log entry for failed tip
                        const logArgs: UserLogKWArgs = { 
                            recipient: Number(recipient),
                            amount: amount,
                            stage: "Failed"
                        } 
                        await logEntry( "Tip", Number(interaction.user.id), logArgs)
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