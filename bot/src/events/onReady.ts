import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption, Routes } from "discord-api-types/v9";
import { Client } from "discord.js";

import { CommandList } from "../commands/_CommandList";
import { errorHandler } from "../utils/errorHandler";
import { logHandler } from "../utils/logHandler";
import { AddPermDev, BuyRamBytesDev, CreateAcctDev, TreasuryBalDev } from "./permissions";

const serverId: string = process.env.DISCORD_GUILD_ID || "945764140520189952"
const bootUser: string = process.env.DISCORD_CLIENT_ID || "945759694411157544"


export const onReady = async (BOT: Client): Promise<void> => {
    // 
    // Prepare the bot, set the slash commands and permissions.
    // 
    try {
        const rest = new REST({ version: "9" }).setToken(
            process.env.DISCORD_TOKEN as string
        )

        const commandData: {
            name: string;
            description?: string;
            type?: number;
            options?: APIApplicationCommandOption[]
        }[] = [];

        CommandList.forEach((command) =>
            commandData.push(
                command.data.toJSON() as {
                name: string;
                description?: string;
                type?: number;
                options?: APIApplicationCommandOption[]
                }
            )
        )

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_CLIENT_ID as string,
                process.env.DISCORD_GUILD_ID as string
            ),
            { body: commandData }
        )
        
        // Set command permissions
        if (!BOT.application?.owner) await BOT.application?.fetch()

        if (process.env.STAGE == "Development") { 
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(BuyRamBytesDev)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(TreasuryBalDev)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(AddPermDev)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(CreateAcctDev)
        }
        else if (process.env.STAGE == "Production") {

        }

        logHandler.info("Bot has connected to Discord!")      
    } catch (err) {
      errorHandler("onReady event", err)
    }
}