import { PriceData } from "../interfaces/PriceData"
import { errorLogger, debugLogger } from "../utils/logHandler"
import { initApi } from "./apiCall"


export const getBalances = async ( userDiscordId: bigint ): Promise<{ 
    "activeBalance": string,
    "oreIdBalance": string,
    "oreIdAccount": string 
}> => {
    let response = { "activeBalance": "None", "oreIdBalance": "None", "oreIdAccount": "None" }
    try {
        const instance = initApi()
    
        const apiData = await instance.get(
            '/api/balance?user=' + String( userDiscordId )
        )
        debugLogger('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        response = { 
            "activeBalance": apiData.data.activeBalance,
            "oreIdBalance": apiData.data.oreIdBalance,
            "oreIdAccount": apiData.data.oreIdAccount
        }
    }
    catch (err) {
        errorLogger("getPrice()", err)           
    }
    return response
}