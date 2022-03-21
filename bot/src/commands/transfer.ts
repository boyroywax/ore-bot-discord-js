import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from '../utils/mongo'
import { unauthorizedCommand } from "../utils/loginCheck"
import { transferFunds } from "../utils/transaction"
import { logEntry } from "../utils/userLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"


function createEmbed(
    title: string,
    description: string,
    direction: string,
    transferAmount: number,
    transferStatus: string): MessageEmbed {
    const embed = new MessageEmbed()
        .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
        .setTitle(title)
        .setDescription(description)
        .addField(
            "Transfer to which account",
            String(direction),
            false
        )
        .addField(
            "Amount",
            String(transferAmount),
            false
        )
        .addField(
            "Error Message",
            String(transferStatus),
            false
        )
    return embed
}

export const transfer: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("transfer")
        .setDescription("Transfer funds from ORE-ID to active account, or vice versa.")
        .addStringOption(option =>
            option.setName('to_account')
                .setDescription('The account to transfer funds to')
                .setRequired(true)
                .addChoice("Active Account", "active")
                .addChoice("ORE-ID Account", "oreid")
        )       
        .addNumberOption(option => option.setName("amount").setDescription("Enter withdrawal amount").setRequired(true)),
    run: async (interaction) => {
        // 
        // Transfer tokens between a users accounts
        // 
        try {       
            // Parse the incoming commnd
            const userDiscordId: bigint = BigInt(interaction.user.id)
            const transferAmount: number = interaction.options.getNumber('amount') || 0.00
            const direction: string = interaction.options.getString('to_account') || 'None'
            let status = "Incoming command parsed."

             // Check if user is already logged in and retrive the lastLogin date as a string
             const [ loggedIn, loginDate ] = await checkLoggedIn(userDiscordId)

             // Alert the user that they are not logged in
            if (loggedIn == false) {
                await unauthorizedCommand(interaction, loginDate)
            }   
            // Only do the withdrawl if the user is logged in
            else if (loggedIn == true) {
                // create an ephemeral message
                await interaction.deferReply({ ephemeral: true})
                const [ transferCompleted, transferStatus ] = await transferFunds(userDiscordId, transferAmount, direction)

                let transferMessage = undefined
                if (!transferCompleted){
                    transferMessage = createEmbed(
                        "❌ ORE Transfer Failed",
                        "Your funds have not been transfered.",
                        direction,
                        transferAmount,
                        transferStatus
                    )
                }
                else {
                    transferMessage = createEmbed(
                        "✅ ORE Transfer Succeeded",
                        "Your funds have been transfered.",
                        direction,
                        transferAmount,
                        transferStatus
                    )  
                }
                // Compose User's log entry for a transfer
                if ( transferCompleted ) {
                    status = "Completed"
                }
                else (
                    status = "Failed"
                )

                const logArgs: UserLogKWArgs = { 
                    recipient: BigInt(userDiscordId),
                    amount: transferAmount,
                    status: status,
                    comment: direction + " " + transferStatus
                } 
                await logEntry( "Transfer", userDiscordId, logArgs )

                await interaction.editReply( {embeds: [transferMessage]})
            }   
        }
        catch (err) {                
            errorHandler("/transfer command", err)
        }
    return 
    }
}
