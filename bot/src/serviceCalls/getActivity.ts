import { UserLog } from "../interfaces/DiscordUser"
import { PriceData } from "../interfaces/PriceData"
import { errorLogger, debugLogger } from "../utils/logHandler"
import { initApi } from "./apiCall"


export const getActivity = async ( userDiscordId: bigint ): Promise<UserLog[]> => {
    let response: UserLog[] = []
    try {
        const instance = initApi()
    
        const apiData = await instance.get(
            '/api/activity?user=' + String( userDiscordId ) 
        )
        debugLogger('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        response = apiData.data
    }
    catch (err) {
        errorLogger("getActivity()", err)           
    }
    return response
}