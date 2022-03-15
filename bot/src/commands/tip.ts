import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, User } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from '../modules/mongo'
import { doTip } from "../modules/tipper"
import { unauthorizedCommand } from "../utils/loginCheck"
import { logHandler } from "../utils/logHandler"
import { logEntry } from "../modules/userLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"


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
        const userDiscordId: bigint = BigInt(interaction.user.id)
        try {
             // Check if user is already logged in and retrive the lastLogin date as a string
             const [ loggedIn, loginDate ] = await checkLoggedIn(userDiscordId)

             // Alert the user that they are not logged in
             if (loggedIn == false) {
                 await unauthorizedCommand(interaction, loginDate)
             }   
             // Only display the balance if the user is logged in
             else if (loggedIn == true) {
                // Create a message only the user can see
                await interaction.deferReply({ ephemeral: true })

                // parse incoming command
                const recipientUserName = interaction.options.getUser('recipient')
                const recipient: bigint = BigInt(interaction.options.getUser('recipient')?.id || 0)
                const amount: number = interaction.options.getNumber('amount') || 0.00
                const [ tipCompleted, tipStatus ]: [boolean, string] = await doTip(userDiscordId, recipient, amount) 
                const tipEmbed = new MessageEmbed().setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')

                // If the tip was successful
                if (tipCompleted) {
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
                        recipient: recipient,
                        amount: amount,
                        status: "Complete"
                    } 
                    await logEntry( "Tip", userDiscordId, logArgs )
                }
                // The tip was unsuccessful
                else {
                    tipEmbed.setTitle("❌ Tip Failed")
                    tipEmbed.setDescription("Your tip to " + recipientUserName?.toString() + " was canceled!")
                    tipEmbed.addField("Tip Amount", String(amount) + " " + process.env.CURRENCY_TOKEN, false)
                    tipEmbed.addField("Reason for failure: ", tipStatus)

                    // compose User's log entry for failed tip
                    const logArgs: UserLogKWArgs = { 
                        recipient: recipient,
                        amount: amount,
                        status: "Failed"
                    } 
                    await logEntry( "Tip", userDiscordId, logArgs)
                }
                await interaction.editReply( {embeds: [tipEmbed]})
            }
            return
        }
        catch (err) {
            errorHandler("/tip command", err)
        }
        return
    }
}