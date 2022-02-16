import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"
import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { checkLoggedIn } from "../modules/mongo"
import { logHandler } from "../utils/logHandler"
import { UserLog } from "../interfaces/DiscordUser"
import { listActivity } from "../modules/userLog"
import { UserLogModel } from "../models/DiscordUserModel"
import { User } from "@sentry/node"

export const activity: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("activity")
        .setDescription("View your activity on the bot"),
    run: async (interaction): Promise<void> => {
        // 
        // Displays the information about the users actions on the bot
        // 
        try {
            // Check if user is already logged in and retrive the lastLogin date as a string
            let [ loggedIn, lastLogin ] = await checkLoggedIn(Number(interaction.user.id)) 
            logHandler.info(loggedIn + " "  + lastLogin)
            // Only display the acctivity info if the user is logged in
            if (loggedIn == true) {
                const userObj = interaction.user
                // Create a message only the user can see
                await interaction.deferReply({ ephemeral: true })
                const userActivityChannel = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')

                // Fetch the user's activites on the bot
                const logEntries: UserLog[] = await listActivity(Number(interaction.user.id))

                userActivityChannel.setTitle("🏃 Activity")
                userActivityChannel.setDescription("Your Latest actions on the ORE Network")
                userActivityChannel.setURL("https://oreid.io")
                userActivityChannel.addField(
                    String("Check Your DM"),
                    String("Your activity has been privately sent to your DM."),
                    false
                )

                let index = 0
                const userActivity = new MessageEmbed()
                for (let entry in logEntries) {
                    index += 1
                    let parseEntry: UserLog = new UserLogModel(logEntries[entry])

                    // There should never be no logs
                    if (logEntries.length == 0) {
                        const noActivity = new MessageEmbed()
                        noActivity.setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                        noActivity.setTitle("🏃 Activity")
                        noActivity.setDescription("Your Latest actions on the ORE Network")
                        noActivity.setURL("https://oreid.io")
                        noActivity.addField(
                            String("No Activity"),
                            String("No one should ever see this..."),
                            false
                        )
                        await userObj.send({ embeds: [noActivity] })
                    }
                    else if (index == 1) {
                        // Construct the list items to embed
                        userActivity.setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                        userActivity.setTitle("🏃 Activity")
                        userActivity.setDescription("Your Latest actions on the ORE Network")
                        userActivity.setURL("https://oreid.io")
                        userActivity.addField(
                            String(parseEntry.date),
                            String(parseEntry.action) + " " + String(parseEntry.stage) + " " + String(parseEntry?.recipient) + " " + String(parseEntry?.amount),
                            false
                        )
                    }
                    else if (index > 10) {
                        break;
                    }
                    else if (index <= logEntries.length) {
                        // const userActivityEntry = new MessageEmbed()
                        userActivity.addField(
                            String(parseEntry.date),
                            String(parseEntry.action) + " " + String(parseEntry.stage) + " " + String(parseEntry?.recipient) + " " + String(parseEntry?.amount),
                            false
                        )
                    }
                }
                userActivity.setFooter(Date.now().toString(), process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                await userObj.send({ embeds: [userActivity] })
                // send the reply to the user in the channel
                await interaction.editReply({ embeds: [userActivityChannel] })
                return
            }
        }
        catch (err) {
            errorHandler('/activity command failed', err)
        }
    return
    }
}