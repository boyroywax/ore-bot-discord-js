import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed, User } from "discord.js"


import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from '../utils/mongo'
import { unauthorizedCommand } from "../utils/loginCheck"
import { logHandler } from "../utils/logHandler"
import { logEntry } from "../utils/userLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"
import { OreBalance } from "../interfaces/OreChain"
import { OreTreasury } from "../modules/oreTreasury"
import { validateAddress, verifyActiveBalance, verifyOreIdBalance} from "../utils/transaction"


export const withdraw: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Withdraws funds from your account")
        .addStringOption(option =>
            option.setName('address')
                .setDescription('The address to withdraw funds to')
                .setRequired(true))        
        .addNumberOption(option => option.setName("amount").setDescription("Enter withdrawal amount").setRequired(true)),
    run: async (interaction) => {
        // 
        // Return the current token price and volume
        // 
        try {       
            // Parse the incoming commnd
            const userDiscordId: bigint = BigInt(interaction.user.id)
            const toAddress: string = interaction.options.getString('address') || 'No Address'
            const withdrawAmount: number = interaction.options.getNumber('amount') || 0.00
            const oreTreasurer: string = process.env.BOT_TREASURER_OREID || ''
            
            let  withdrawError: string = "None"

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

                // check that the address is valid
                const [ addressVerified, addressStatus ] = await validateAddress(toAddress)


                // check that the user has the proper funds
                if (!addressVerified) {
                    withdrawError = "That address is not valid!"
                }
                else {
                    const [ userBalanceVerify, userBalanceStatus ] = await verifyActiveBalance(userDiscordId, withdrawAmount)
                    if (!userBalanceVerify) {
                        withdrawError = userBalanceStatus
                    }
                    else {
                        // check that the treasury has required funds
                        const [ oreTreasuryVerify, oreTreasuryStatus ] = await verifyOreIdBalance(oreTreasurer, withdrawAmount)
                        if (!oreTreasuryVerify) {
                            withdrawError = oreTreasuryStatus
                        }
                        else {
                            // create treasury instance
                            const treasury = new OreTreasury
                            // make withdrawal
                            const [ withdrawCompleted, withdrawStatus ] = await treasury.makeWithdrawl(withdrawAmount, toAddress)
                            
                            
                            if (withdrawCompleted) {
                                // embed a success message
                                const withdrawEmbed = new MessageEmbed()
                                    .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                                    .setTitle("✅ ORE Withdrawl Success")
                                    .setDescription('Your funds have been trnsfered.')
                                    .addField(
                                        "Withdraw Address",
                                        String(toAddress),
                                        false
                                    )
                                    .addField(
                                        "Amount",
                                        String(withdrawAmount),
                                        false
                                    )
                                    .addField(
                                        "Transaction Id",
                                        String(oreTreasuryStatus),
                                        false
                                    )
                    
                                await interaction.editReply( {embeds: [withdrawEmbed]})
                                return
                            }
                            else {
                                withdrawError = withdrawStatus
                            }
                        }
                    }
                                
                }
                // add a failure message
                const withdrawEmbed = new MessageEmbed()
                    .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                    .setTitle("❌ ORE Withdrawl Failed")
                    .setDescription('Your funds have not been trnsfered.')
                    .addField(
                        "Withdraw Address",
                        String(toAddress),
                        false
                    )
                    .addField(
                        "Amount",
                        String(withdrawAmount),
                        false
                    )
                    .addField(
                        "Error Message",
                        String(withdrawError),
                        false
                    )
    
                await interaction.editReply( {embeds: [withdrawEmbed]})
            }
        }
        catch (err) {
            errorHandler("/withdrawl command", err)
        }
    return
    }
}