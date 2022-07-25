import { initApi } from "./apiCall"


export const setLogout = async (state: string): Promise<boolean> => {
    let response: boolean = false
    try {
        const instance = initApi()
        const url = 'logout?state=' + state
    
        const apiData = await instance.get(url)
        console.info('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        response = apiData.data.result as boolean
    }
    catch (err) {
        console.error("setLogout", err)           
    }
    // await interaction.reply("hello there")
    return response
}