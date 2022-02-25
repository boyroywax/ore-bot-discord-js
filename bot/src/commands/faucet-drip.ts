import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from '../modules/mongo'
import { faucetDrip } from "../modules/tipper"
import { unauthorizedCommand } from "../utils/loginCheck"
import { logHandler } from "../utils/logHandler"
import { logEntry } from "../modules/userLog"
import { UserLogKWArgs } from "../interfaces/DiscordUser"


export const drip: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("drip")
        .setDescription("Drops a small amount of  " + process.env.CURRENCY + " tokens!" ),
    run: async (interaction) => {
        // 
        // Create a faucet user to manage the faucets balance.
        // 
        const userDiscordId: bigint = BigInt(interaction.user.id)
        try {
            // Make sure the user is logged in
            let userCheck = await checkLoggedIn(userDiscordId)
            .then(async function(response: [boolean, string]) {
                if (response[0] == true) {
                    // parse command
                    const recipientUserName = interaction.user
                    const recipient: bigint = userDiscordId

                    const [ dripCompletion, dripAmount, dripComment ] = await faucetDrip( recipient ) 

                    // Create a message only the user can see
                    await interaction.deferReply({ ephemeral: true })
                    const dripEmbed = new MessageEmbed().setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')

                    if (dripCompletion) {
                        dripEmbed.setTitle("🚰 Faucet Claimed")
                        dripEmbed.setDescription("The faucet dripped some " + process.env.CURRENCY + " tokens to  " + recipientUserName.toString())
                        dripEmbed.addField(
                            "Drip Amount",
                            String(dripAmount) + " " + process.env.CURRENCY_TOKEN,
                            false
                        )

                        // Compose User's log entry for a succesfull faucetDrip
                        const logArgs: UserLogKWArgs = { 
                            amount: dripAmount,
                            comment: dripComment,
                            status: "Complete"
                        } 
                        await logEntry( "FaucetDrip", userDiscordId, logArgs )
                        
                    }
                    else {
                        dripEmbed.setTitle("❌ Faucet Claim Failed")
                        dripEmbed.setDescription("The faucet did not drop any tokens!")
                        dripEmbed.addField("Reason for failure", dripComment, false)

                         // compose User's log entry for failed faucetDrip
                         const logArgs: UserLogKWArgs = {
                            comment: dripComment, 
                            status: "Failed"
                        } 
                        await logEntry( "FaucetDrip", userDiscordId, logArgs)
                    }
                    await interaction.editReply( {embeds: [dripEmbed]})
                }
                else {
                    return await unauthorizedCommand(interaction, response[1])
                }
            })
        }
        catch (err) {
            errorHandler("/drip command failed: ", err)
        }
    }
}