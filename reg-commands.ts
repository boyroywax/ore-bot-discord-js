import fs from 'fs'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import * as dotenv from 'dotenv'

// import { logger } from './modules/logging'

dotenv.config();

const clientId = process.env.DISCORD_CLIENT_ID || ''
const guildId = process.env.DISCORD_GUILD_ID || ''
const token = process.env.DISCORD_TOKEN || ''

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);