import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption, Routes } from "discord-api-types/v9";
import { Client } from "discord.js";

import { CommandList } from "../commands/_CommandList";
import { errorHandler } from "../utils/errorHandler";
import { logHandler } from "../utils/logHandler";


export const onReady = async (BOT: Client): Promise<void> => {
  try {
    const rest = new REST({ version: "9" }).setToken(
      process.env.DISCORD_TOKEN as string
    );

    const commandData: {
      name: string;
      description?: string;
      type?: number;
      options?: APIApplicationCommandOption[];
    }[] = [];

    CommandList.forEach((command) =>
      commandData.push(
        command.data.toJSON() as {
          name: string;
          description?: string;
          type?: number;
          options?: APIApplicationCommandOption[];
        }
      )
    );
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID as string,
        process.env.DISCORD_GUILD_ID as string
      ),
      { body: commandData }
    );
    logHandler.info("Bot has connected to Discord!")
  } catch (err) {
    errorHandler("onReady event", err)
  }
};