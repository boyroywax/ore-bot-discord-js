import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"
import { AccountResources } from "../modules/accountResources"

export const delegateBW: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("delegatecpunet")
        .setDescription("delegate resorces on the ORE blockchain")
        .setDefaultPermission(false)
        .addNumberOption(option => option.setName("cpu").setDescription("Amount to stake to CPU").setRequired(true))
        .addNumberOption(option => option.setName("net").setDescription("Amount to stake to NET").setRequired(true)),

    run: async (interaction) => {
        // 
        // Create an Accountn on the ORE Blockchain
        // 
        try {       
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: true })

            const cpu: number = interaction.options.getNumber('cpu') || 0.00
            const net: number = interaction.options.getNumber('net') || 0.00

            const treasury = new AccountResources

            // const [ depositaddress, depositQrCode ] = await treasury.getDepositAddress(discordUser)
            const [ isCompleted, status ] = await treasury.delegateCpuNet(String(cpu), String(net))

            const accountCreateEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Treasury Delegate CPU and NET")
                .setDescription('Staking resources on blockchain.')
                .addField(
                    "Transaction Status | " + isCompleted,
                    String(status),
                    false
                )
    
            await interaction.editReply( {embeds: [accountCreateEmbed]} )
        }
        catch (err) {
            errorHandler("/createAccount command", err)
        }
        return
    }
}
