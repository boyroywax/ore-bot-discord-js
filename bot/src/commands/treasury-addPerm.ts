import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed, User } from "discord.js"

import { CommandInt } from "../interfaces/CommandInt"
import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"
import { OreTreasury } from "../modules/oreTreasury"


export const addperm: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("addperm")
        .setDescription("Setup the bot's treasurer account by add Permission")
        .setDefaultPermission(false)
        .addStringOption(option => option.setName('name')
            .setDescription('The permission name.')
            .setRequired(true))
        .addStringOption(option => option.setName('parent')
            .setDescription('The permissions parent.')
            .setRequired(true)),
    run: async (interaction) => {
        // 
        // Add permissions to an this on the ORE Blockchain
        // 
        try {       
            // Create a message only the user can see
            await interaction.deferReply({ ephemeral: true })

            const name: string = interaction.options.getString('name') || ''
            const parent: string = interaction.options.getString('parent') || ''

            const treasury = new OreTreasury

            // const [ depositaddress, depositQrCode ] = await treasury.getDepositAddress(discordUser)
            const [txid] = await treasury.addPermission(name, parent)

            const addPermEmbed = new MessageEmbed()
                .setThumbnail(process.env.CURRENCY_LOGO || 'https://imgur.com/5M8hB6N.png')
                .setTitle("ORE Treasury addPermission")
                .setDescription('Add permission to an account on the ORE Blockchain')
                .addField(
                    "Transaction ID",
                    String(txid),
                    false
                )
    
            await interaction.editReply( {embeds: [addPermEmbed]} )
        }
        catch (err) {
            errorHandler("/createAccount command", err)
        }
        return
    }
}