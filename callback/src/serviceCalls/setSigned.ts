import { AxiosInstance } from "axios"

import { initApi } from "./apiCall"


export const setSigned = async (state: string, account: string): Promise<boolean> => {
    let response: boolean = false
    try {
        const instance: AxiosInstance = initApi()
        const url = 'sign?state=' + state + '&account=' + account
    
        const apiData = await instance.get(url)
        console.info('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        response = apiData.data.result as boolean
    }
    catch (err) {
        console.error("setSigned", err)           
    }
    // await interaction.reply("hello there")
    return response
}