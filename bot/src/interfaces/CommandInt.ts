import {
    SlashCommandBuilder,
    SlashCommandNumberOption,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    SlashCommandUserOption
  } from "@discordjs/builders"
import { Options } from "@sentry/types"
  import { ApplicationCommandOption, CommandInteraction } from "discord.js"
  
  export interface CommandInt {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | any
    run: (interaction: CommandInteraction) => Promise<void>
  }