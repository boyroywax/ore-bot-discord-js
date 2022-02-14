import { errorHandler } from "../utils/errorHandler";
import { logHandler } from "../utils/logHandler";
import { Client, GuildEmoji } from "discord.js";

export const loadEmojis = async (BOT: Client): Promise<[string]> => {
    let emojis: [string] = ["None"]
  try {
    // declare custom emoji
    emojis = [ BOT.emojis.cache.find(emoji => emoji.name === "oreidlogo")?.toString() || "None" ]

    logHandler.info("Bot has connected to Discord!")
  } catch (err) {
    errorHandler("onReady event", err)
  }
  return emojis
};