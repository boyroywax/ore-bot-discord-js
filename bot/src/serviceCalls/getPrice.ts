import axios from "axios"

import { PriceData } from "interfaces/PriceData"
import {  errorLogger, debugLogger } from "../utils/logHandler"


export const getPrice = async (): Promise<PriceData> => {
    let response = JSON.parse('{"error": "Price Not Found"}')
    try {
        const port: string = process.env.SERVICE_PORT || "53134"
        const baseurl = `http://${process.env.SERVICE_URL}:${port}`

        const instance = axios.create({
            baseURL: baseurl || 'ore-service-d:53134',
            timeout: 100000,
            headers: {'accept': 'application/json'}
        })
    
        const apiData = await instance.get('priceOre')
        debugLogger('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        response = apiData.data as PriceData
    }
    catch (err) {
        errorLogger("getApiData()", err)           
    }
    // await interaction.reply("hello there")
    return response
}