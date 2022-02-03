import { Interaction } from "discord.js";
import { CommandList } from "../commands/_CommandList";
import { errorHandler } from "../utils/errorHandler";
import { logHandler } from "../utils/logHandler";

export const onInteraction = async (
  interaction: Interaction
): Promise<void> => {
  try {
    if (interaction.isCommand()) {
      for (const Command of CommandList) {
        if (interaction.commandName === Command.data.name) {
          await Command.run(interaction);
          logHandler.info("Running a Command")
          break;
        }
      }
    }
  } catch (err) {
    errorHandler("onInteraction event", err);
  }
};