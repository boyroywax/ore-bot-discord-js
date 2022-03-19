import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption, Routes } from "discord-api-types/v9";
import { ApplicationCommandPermissionData, ApplicationCommandPermissions, ApplicationCommandPermissionsManager, ApplicationCommandResolvable, Client, GuildApplicationCommandPermissionData } from "discord.js";

import { CommandList } from "../commands/_CommandList";
import { errorHandler } from "../utils/errorHandler";
import { logHandler } from "../utils/logHandler";
import { AddPerm, BuyRamBytes, CreateAcct, TreasuryBal } from "./permissions";

const serverId: string = process.env.DISCORD_GUILD_ID || "945764140520189952"
const bootUser: string = process.env.DISCORD_CLIENT_ID || "945759694411157544"




export const onReady = async (BOT: Client): Promise<void> => {
    
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
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(BuyRamBytes)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(TreasuryBal)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(AddPerm)
            await BOT.guilds.cache.get(serverId)?.commands.permissions.set(CreateAcct)
        }
        else if (process.env.STAGE == "Production") {

        }


        // const commands = await BOT.guilds.cache.get(serverId)?.commands.fetch() || new Map
        // logHandler.info("commands: " + JSON.stringify(commands))

        
        // for (const [command, commandData] of commands) {
        //     logHandler.info("command: " + command + " " + commandData)
        //     const permissions: ApplicationCommandPermissionData[] = [
        //         {
        //             id: '224617799434108928',
        //             type: 'USER',
        //             permission: false,
        //         },
        //     ]
    
        //     if (command) {
        //         await command.permissions.add({ permissions })
        //     }
        // }


        logHandler.info("Bot has connected to Discord!")      
    } catch (err) {
      errorHandler("onReady event", err)
    }
}