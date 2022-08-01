import { initApi } from "./apiCall"


export const getTips = async ( userId: string, format: string ): Promise<any> => {
    try {
        const instance = initApi()
    
        const apiData = await instance.get(
            '/tips?format=' + format + '&user=' + userId
        )
        console.log('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        let response = apiData.data
        return response
    }
    catch (err) {
        console.error("getUser()", err)           
    }

}