import { initApi } from "./apiCall"


export const checkOreIdLink = async (currentUserOreId: string, state: string): Promise<{available: boolean, oreIdLinked: string}> => {
    let response = {available: false, oreIdLinked: "None"}
    try {
        const instance = initApi()
        const url = 'checkOreIdLink?oreid=' + currentUserOreId + "&state=" + state
    
        const apiData = await instance.get(url)
        console.info('Data retrieved from Service: ' + JSON.stringify(apiData.data))
        const actionAvailable = Boolean(apiData.data.available)
        const oreIdLinked = String(apiData.data.oreIdLinked) || "None"
        response = {"available": actionAvailable, "oreIdLinked": oreIdLinked }
    }
    catch (err) {
        console.error("checkOreIdLink()", err)    
    }
    return response
}