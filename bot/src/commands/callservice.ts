import { SlashCommandBuilder } from "@discordjs/builders"
import axios from "axios"
import { CommandInt } from "../interfaces/CommandInt"

import { errorHandler } from "../utils/errorHandler"
import { logHandler } from "../utils/logHandler"


export const callservice: CommandInt = {
    data: new SlashCommandBuilder()
        .setName("callapi")
        .setDescription("Test call the Api." ),
    run: async (interaction) => {
        try {
            const port: string = process.env.SERVICE_PORT || "53134"
            const baseurl = `http://${process.env.SERVICE_URL}:${port}`

            const instance = axios.create({
                baseURL: baseurl || 'ore-service-d:53134',
                timeout: 100000,
                headers: {'accept': 'application/json'}
            })
        
            const apiData = await instance.get('priceOre')
            logHandler.debug('Data retrieved from CoinGecko: ' + JSON.stringify(apiData.data))
        
            // this.dateCreated = apiData.data['market_data']['timestamp'] || new Date
            // this.priceUSD = apiData.data['market_data']['current_price']['usd']
            // this.volumeUSD = apiData.data['market_data']['total_volume']['usd']
            // this.priceChange24h = apiData.data['market_data']['price_change_percentage_24h']
            // await createPriceEntry(this)
        }
        catch (err) {
            errorHandler("getApiData()", err)           
        }
        // await interaction.reply("hello there")
        return
    }
}