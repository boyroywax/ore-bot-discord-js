import { initApi } from "./apiCall"


export const setLogin = async (state: string, account: string): Promise<boolean> => {
    let response = JSON.parse('{"error": "Could not verify logout"}')
    try {
        const instance = initApi()
        const url = 'login?state=' + state + '&account=' + account
    
        const apiData = await instance.get(url)
        console.info('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        response = apiData.data.result as boolean
    }
    catch (err) {
        console.error("setLogin", err)           
    }
    // await interaction.reply("hello there")
    return response
}