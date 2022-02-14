import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from '../modules/mongo'
import { doTip } from "../modules/tipper"
import { unauthorizedCommand } from "../utils/loginCheck";
import { logHandler } from "../utils/logHandler";


// function getUserFromMention(mention) {
// 	if (!mention) return;

// 	if (mention.startsWith('<@') && mention.endsWith('>')) {
// 		mention = mention.slice(2, -1);

// 		if (mention.startsWith('!')) {
// 			mention = mention.slice(1);
// 		}

// 		return client.users.cache.get(mention);
// 	}
// }

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
                    // retrieve the mentioned user

                    // parse command
                    const recipientUserName: string = interaction.options.getUser('recipient')?.username || "None"
                    const recipient = interaction.options.getUser('recipient')?.id || 0
                    const amount: number = interaction.options.getNumber('amount') || 0.00
                    logHandler.info("message from /tip: " + recipient + " " + amount)
                    const tipResult: [boolean, string] = await doTip(Number(interaction.user.id), Number(recipient), amount) 

                    // Create a message only the user can see
                    await interaction.deferReply({ ephemeral: true })
                    const tipEmbed = new MessageEmbed()

                    if (tipResult[0]) {
                        tipEmbed.setTitle("✅ Tip Complete")
                        tipEmbed.setDescription("Your tip to @" + recipientUserName + " succeeded!")
                        tipEmbed.addField("Tip Amount", String(amount), false)
                    }
                    else {
                        tipEmbed.setTitle("❌ Tip Failed")
                        tipEmbed.setDescription("Your tip to @" + recipientUserName + " was canceled!")
                        tipEmbed.addField("Tip Amount", String(amount), false)
                        tipEmbed.addField("Reason for failure: ", tipResult[1])
                    }
                    await interaction.editReply( {embeds: [tipEmbed]})
                }
                else {
                    return await unauthorizedCommand(interaction, response[1])
                }
            })
        }
        catch (err) {
            errorHandler("/tip failed: ", err)
        }
    }
}