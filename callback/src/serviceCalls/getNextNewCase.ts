import { initApi } from "./apiCall";

export const getNextNewCase = async (): Promise<{"nextcase": number}> => {
    let result = {"nextcase": 1}
    try {
        const instance = initApi()
    
        const apiData = await instance.post(
            '/proposal' , {"action": "nextcase"}
        )
        console.log('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        result = apiData.data
    }
    catch (err) {
        console.error("getNextNewCase")
    }
    return result

}