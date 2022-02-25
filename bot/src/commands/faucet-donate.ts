import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from "../modules/mongo"
import { unauthorizedCommand } from "../utils/loginCheck"
import { faucetDonate } from "../modules/tipper"
import { logEntry } from "../modules/userLog";
import { UserLogKWArgs } from "../interfaces/DiscordUser";


export const donate: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("donate")
        .setDescription("Donate to the 🚰 faucet fund!")
        .addNumberOption(option => option.setName("amount").setDescription("Enter donation amount").setRequired(true)),

    run: async (interaction): Promise<void> => {
        // 
        // Donates an amount of a user's funds to the faucet fund.
        // 
        const userDiscordId: bigint = BigInt(interaction.user.id)
        const amount: number = interaction.options.getNumber('amount') || 0.00 
        try {
            // Check if user is already logged in and retrive the lastLogin date as a string
            let [ loggedIn, lastLogin ] = await checkLoggedIn(userDiscordId) 
            
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: true })
            const donationEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')

            // Only display the acctivity info if the user is logged in
            if (loggedIn == false) {
                await unauthorizedCommand(interaction, lastLogin)
            }
            else if (loggedIn == true) {
                const userObj = interaction.user
                let [ donationCompleted, donationComment, donationFundTotal ] = await faucetDonate(amount, userDiscordId)
            
                if (donationCompleted) {
                    donationEmbed.setTitle("✅ Donation Complete")
                    donationEmbed.setDescription("Your donation to the 🚰 Faucet Fund succeeded!")
                    donationEmbed.addField("Amount Donated", String(amount) + " " + process.env.CURRENCY_TOKEN, false)
                    donationEmbed.addField("Faucet Balance", String(donationFundTotal) + " " + process.env.CURRENCY_TOKEN, false)

                    // Compose User's log entry for a succesfull donation
                    const logArgs: UserLogKWArgs = { 
                        recipient: BigInt(99),
                        amount: amount,
                        status: "Complete",
                        comment: donationComment
                    }
                    await logEntry( "FaucetDonate", userDiscordId, logArgs )

                    // Send PM to the sender of the donation
                    await interaction.user.send( {embeds: [donationEmbed]} )

                    // Edit the pending message embed
                    await interaction.editReply( {embeds: [donationEmbed]} )
                }
                else {
                    donationEmbed.setTitle("❌ Donation Failed")
                    donationEmbed.setDescription("Your donation to the 🚰 Faucet Fund Failed!")
                    donationEmbed.addField("Amount Donated", String(amount) + " " + process.env.CURRENCY_TOKEN, false)
                    donationEmbed.addField("Faucet Balance", String(donationFundTotal) + " " + process.env.CURRENCY_TOKEN, false)
                    donationEmbed.addField("Reason for failure", donationComment )

                    await interaction.editReply( {embeds: [donationEmbed]} )

                    // Compose User's log entry for a failed donation
                    const logArgs: UserLogKWArgs = { 
                        recipient: BigInt(99),
                        amount: amount,
                        status: "Failed",
                        comment: donationComment
                    } 
                    await logEntry( "FaucetDonate", userDiscordId, logArgs )
                   
                }
            }
        }
        catch (err) {
            errorHandler("donate failed", err)
        }
    return
    }
}