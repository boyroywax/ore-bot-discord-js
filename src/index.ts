import run from './modules/oreid'
// import * as Cookie from 'js-cookie'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import * as dotenv from 'dotenv'
import { Client, Intents } from 'discord.js'


dotenv.config();

const CLIENT_ID = '936064780081434737'
const GUILD_ID = '936064058942177301'
const DISCORD_TOKEN = process.env.DISCORD_TOKEN

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('messageCreate', message => {
    if (message.content === 'hello') {
        message.channel.send('Hello World~!');
    }
    if (message.content === 'testbot') {
        message.channel.send("Hi! I'm up and Running~!");
    }
    if (message.content === 'ping') {
        message.channel.send('Pong~!');
    } 
})

client.once('ready', () => {
    console.log('The Discord Bot is Ready!');
})

client.login(DISCORD_TOKEN)