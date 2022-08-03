import { initApi } from "./apiCall"


export const getTips = async ( discordId: bigint, format: string ): Promise<any> => {
    try {
        const instance = initApi()
    
        const apiData = await instance.get(
            '/tips?format=' + format + '&user=' + discordId.toString()
        )
        console.log('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        let response = apiData.data
        return response
    }
    catch (err) {
        console.error("getTips", err)           
    }

}