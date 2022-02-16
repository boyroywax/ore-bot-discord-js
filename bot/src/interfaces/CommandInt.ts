import {
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
  } from "@discordjs/builders"
  import { CommandInteraction } from "discord.js"
  
  export interface CommandInt {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | any
    run: (interaction: CommandInteraction) => Promise<void>
  }