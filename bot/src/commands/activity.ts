import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from "../utils/mongo"
import { logHandler } from "../utils/logHandler"
import { UserLog } from "../interfaces/DiscordUser"
import { listActivity } from "../utils/userLog"
import { UserLogModel } from "../models/DiscordUserModel"
import { unauthorizedCommand } from "../utils/loginCheck"

const maxLogActivity: number = Number(process.env.BOT_ACTIVITY_LOG_MAX) || 10

export const activity: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("activity")
        .setDescription("View your most recent activity"),
    run: async (interaction): Promise<void> => {
        // 
        // Displays the information about the users actions on the bot
        // 
        const userDiscordId: bigint = BigInt(interaction.user.id)
        try {
            // Check if user is already logged in and retrive the lastLogin date as a string
            const [ loggedIn, lastLogin ] = await checkLoggedIn(userDiscordId) 

            // Only display the acctivity info if the user is logged in
            if (loggedIn == false) {
                await unauthorizedCommand(interaction, lastLogin)
            }
            else if (loggedIn == true) {
                const userObj = interaction.user
                // Create a message only the user can see
                await interaction.deferReply({ ephemeral: true })

                // Fetch the user's activites on the bot
                const logEntries: UserLog[] = await listActivity(userDiscordId)

                // Create the Embed from the logEntries
                let index: number = 0
                const userActivity: MessageEmbed = new MessageEmbed()
                for (let entry in logEntries) {
                    index += 1
                    let parseEntry: UserLog = new UserLogModel(logEntries[entry])

                    // There should never be no logs
                    if (logEntries.length == 0) {
                        const noActivity = new MessageEmbed()
                            .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                            .setTitle("🏃 Activity")
                            .setDescription("Your Latest actions on the ORE Network")
                            .setURL("https://oreid.io")
                            .addField(
                                String("No Activity"),
                                String("No one should ever see this..."),
                                false
                            )
                        await userObj.send({ embeds: [noActivity] })
                    }
                    // Prepare the header and first message peice
                    else if (index == 1) {
                        // Construct the list items to embed
                        userActivity.setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                        userActivity.setTitle("🏃 Activity")
                        userActivity.setDescription("Your latest 10 actions on the ORE Network Bot")
                        userActivity.setURL("https://oreid.io")
                        if (parseEntry?.recipient != BigInt(0)) {
                            userActivity.addField(
                                index + ". " + String(parseEntry.action) + " | " + String(parseEntry.status),
                                String(parseEntry.date.toDateString()) + " " + String(parseEntry.date.toLocaleTimeString()),
                                true
                            )
                            userActivity.addField(
                                "Recipient",
                                String(parseEntry?.recipient),
                                true
                            )
                            userActivity.addField(
                                "Amount",
                                String(parseEntry?.amount),
                                true
                            )
                        }
                        else {
                            userActivity.addField(
                                index + ". " + String(parseEntry.action) + " | " + String(parseEntry.status),
                                String(parseEntry.date.toDateString()) + " " + String(parseEntry.date.toLocaleTimeString()),
                                false
                            )
                        }
                    }
                    // If the index is greater than the Max Log Activity env variable, exit the for loop
                    else if (index > maxLogActivity) {
                        break;
                    }
                    // Add fields to the first message peice for each of X-1 remaining entries
                    else if (index <= logEntries.length) {
                        if (parseEntry?.recipient != BigInt(0)) {
                            userActivity.addField(
                                index + ". " + String(parseEntry.action) + " | " + String(parseEntry.status),
                                String(parseEntry.date.toDateString()) + " " + String(parseEntry.date.toLocaleTimeString()),
                                true
                            )
                            userActivity.addField(
                                "Recipient",
                                String(parseEntry?.recipient),
                                true
                            )
                            userActivity.addField(
                                "Amount",
                                String(parseEntry?.amount),
                                true
                            )
                        }
                        else {
                            userActivity.addField(
                                index + ". " + String(parseEntry.action) + " | " + String(parseEntry.status),
                                String(parseEntry.date.toDateString()) + " " + String(parseEntry.date.toLocaleTimeString()),
                                false
                            )
                        }
                    }
                }
                const now = new Date
                userActivity.setFooter(String(now.toDateString()) + " " + String(now.toLocaleTimeString()), process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')

                await interaction.editReply({ embeds: [userActivity] })
                return
            }
        }
        catch (err) {
            errorHandler('/activity command', err)
        }
    return
    }
}