import * as dotenv from 'dotenv'
import { Client, Collection, Intents, Interaction } from 'discord.js'
import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
import { validateEnv } from "./utils/validateEnv";
import { onReady } from "./events/onReady";
import { onInteraction } from "./events/onInteraction";
import { logHandler } from './utils/logHandler';


(async () => {
    logHandler.info("Starting " + process.env.CURRENCY_NAME + " Discord Bot...")
    dotenv.config()
    validateEnv()

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
        integrations: [
        new RewriteFrames({
            root: global.__dirname,
        }),
        ],
    })

    const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

    client.on("ready", async () => await onReady(client));

    client.on(
        "interactionCreate",
        async (interaction: Interaction) => await onInteraction(interaction)
    );

    await client.login(process.env.DISCORD_TOKEN as string)
})()