import { PriceData } from "../interfaces/PriceData"
import { errorLogger, debugLogger } from "../utils/logHandler"
import { initApi } from "./apiCall"


export const getPrice = async (): Promise<PriceData> => {
    let response = JSON.parse('{"error": "Price Not Found"}') as PriceData
    try {
        const instance = initApi()
    
        const apiData = await instance.get('/api/priceOre')
        debugLogger('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        response = apiData.data.price as PriceData
    }
    catch (err) {
        errorLogger("getPrice()", err)           
    }
    return response
}