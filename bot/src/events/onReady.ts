import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption, Routes } from "discord-api-types/v9";
import { Client } from "discord.js";

import { CommandList } from "../commands/_CommandList";
import { errorHandler } from "../utils/errorHandler";
import { logHandler } from "../utils/logHandler";
import { AddPermDev, BuyRamBytesDev, CreateAcctDev, StakeResourcesDev, TreasuryBalDev } from "./permissions";
import { AddPerm, BuyRamBytes, CreateAcct, StakeResources, TreasuryBal } from "./permissions";

const serverId: string = process.env.DISCORD_GUILD_ID || "945764140520189952"
const botUser: string = process.env.DISCORD_CLIENT_ID || "945759694411157544"


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

        const commands = await BOT.guilds.cache.get(serverId)?.commands.fetch() || new Map
        logHandler.info("Commands: " + JSON.stringify(commands))
        for ( let [ command, commandInfo ] of commands  ) {
            logHandler.info('command: ' + command + " " + commandInfo)
        }

        if (process.env.STAGE == "Development") { 
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(BuyRamBytesDev)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(TreasuryBalDev)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(AddPermDev)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(CreateAcctDev)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(StakeResourcesDev)
        }
        else if (process.env.STAGE == "Production") {
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(BuyRamBytes)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(TreasuryBal)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(AddPerm)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(CreateAcct)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(StakeResources)
        }

        logHandler.info("Bot has connected to Discord!")      
    } catch (err) {
      errorHandler("onReady event", err)
    }
}