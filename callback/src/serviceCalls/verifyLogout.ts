import { initApi } from "./apiCall"
import axios from "axios"


export const verifyLogout = async (state: string): Promise<boolean> => {
    let response = JSON.parse('{"error": "Could not verify logout"}')
    try {
        const port: string = process.env.REACT_APP_API_SERVICE_PORT || "53134"
        const baseurl = `http://${process.env.REACT_APP_API_SERVICE_URL}:${port}`

    const instance = axios.create({
        baseURL: baseurl || 'http://ore-service-d:53134',
        timeout: 100000,
        headers: {'accept': 'application/json'}
    })
        const url = 'logout?state=' + state
    
        const apiData = await instance.get(url)
        console.info('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        response = apiData.data.result as boolean
    }
    catch (err) {
        console.error("verifyLogout", err)           
    }
    // await interaction.reply("hello there")
    return response
}