import { PriceData } from "../interfaces/PriceData"
import { errorLogger, debugLogger } from "../utils/logHandler"
import { initApi } from "./apiCall"


export const checkOreIdLink = async (oreIdAttemptingToLink: string, state: string): Promise<{available: boolean, oreIdLinked: string}> => {
    let response = {available: true, oreIdLinked: "None"}
    try {
        const instance = initApi()
    
        const apiData = await instance.get('/api/checkOreIdLink', {
            params: {
                oreId: oreIdAttemptingToLink,
                state: state
            }
        })
        debugLogger('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        const availableToLink = Boolean(apiData.data.available) || response.available
        const oreIdLinked = String(apiData.data.oreIdLinked) || response.oreIdLinked
        response = {available: availableToLink, oreIdLinked: oreIdLinked }
    }
    catch (err) {
        errorLogger("checkOreIdLink()", err)           
    }
    return response
}