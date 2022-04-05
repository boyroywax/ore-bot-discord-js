import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed, User } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"
import { OreBalance } from "../interfaces/OreChain"
import { OreTreasury } from "../modules/oreTreasury"
import { checkLoggedIn } from "../utils/mongo"
import { unauthorizedCommand } from "../utils/loginCheck"


export const deposit: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Returns your deposit address" ),
    run: async (interaction) => {
        // 
        // Return the current token price and volume
        // 
        try {       
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: true})

            // parse the incoming user's command
            const userDiscordId: bigint = BigInt(interaction.user.id)

            // Check if user is already logged in and retrive the lastLogin date as a string
            const [ loggedIn, loginDate ] = await checkLoggedIn(userDiscordId)

            // Alert the user that they are not logged in
            if (loggedIn == false) {
                await unauthorizedCommand(interaction, loginDate)
            }   
            // Only do the withdrawl if the user is logged in
            else if (loggedIn == true) {

                const discordUser: User = interaction.user

                const treasury = new OreTreasury

                const [ depositaddress, depositMemo ] = await treasury.getDepositAddress(discordUser)

                const depositEmbed = new MessageEmbed()
                    .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                    .setTitle("ORE Deposit Address")
                    .setDescription('Only Send ORE Native tokens to this account.  You must include the memo in your transfer.  Do Not send ETH, MATIC, EOS, etc')
                    .addField(
                        "Deposit Address",
                        String(depositaddress),
                        false
                    )
                    .addField(
                        "Memo",
                        String(depositMemo),
                        false
                    )
    
                await interaction.editReply( {embeds: [depositEmbed]})
            }
        }
        catch (err) {
            errorHandler("/deposit command", err)
        }
        return
    }
}