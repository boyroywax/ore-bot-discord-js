import { initApi } from "./apiCall"


export const verifyLogout = async (state: string): Promise<boolean> => {
    let response = JSON.parse('{"error": "Could not verify logout"}')
    try {
        const port: string = process.env.SERVICE_PORT || "53134"
        const baseurl = `http://${process.env.SERVICE_URL}:${port}`

        const instance = initApi()
    
        const apiData = await instance.get('logout')
        console.info('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        response = apiData.data as boolean
    }
    catch (err) {
        console.error("verifyLogout", err)           
    }
    // await interaction.reply("hello there")
    return response
}