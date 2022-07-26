import { AxiosInstance } from "axios"


import { initApi } from "./apiCall"


export const setLoginError = async ( errorMsg: string, state: string ): Promise<boolean> => {
    let response: boolean = false
    try {
        const instance: AxiosInstance = initApi()
        const url = 'loginError?error=' + errorMsg + '&state=' + state
    
        const apiData = await instance.get(url)
        console.info('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        response = apiData.data.result as boolean
    }
    catch (err) {
        console.error("setLoginError", err)           
    }
    // await interaction.reply("hello there")
    return response
}