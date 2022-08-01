import { initApi } from "./apiCall"


export const getActivity = async ( userDiscordId: bigint ): Promise<any> => {
    let response: any = "Loading"
    try {
        const instance = initApi()
    
        const apiData = await instance.get(
            '/activity?user=' + String( userDiscordId ) 
        )
        console.log('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        response = apiData.data
    }
    catch (err) {
        console.error("getActivity()", err)           
    }
    return response
}