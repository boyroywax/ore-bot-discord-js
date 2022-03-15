import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed, User } from "discord.js"


import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from '../modules/mongo'
import { unauthorizedCommand } from "../utils/loginCheck"
import { logHandler } from "../utils/logHandler"
import { logEntry } from "../modules/userLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"
import { OreBalance } from "../interfaces/OreChain"
import { OreTreasury } from "../utils/oreTreasury"
import { validateAddress} from "../utils/transaction"


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
                const [ addressCompleted, addressStatus ] = await validateAddress(toAddress)

                // check that the user has the proper funds



                // create treasury instance
                const treasury = new OreTreasury

                const [ depositaddress, depositQrCode ] = await treasury.makeWithdrawl(withdrawAmount, toAddress)

                const withdrawEmbed = new MessageEmbed()
                    .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                    .setTitle("ORE Deposit Address")
                    .setDescription('Only Send ORE Native tokens to this account.  Do Not send ETH, MATIC, EOS, etc')
                    .addField(
                        "Deposit Address",
                        String(depositaddress),
                        false
                    )
                    .addField(
                        "QR COde",
                        String(depositQrCode),
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