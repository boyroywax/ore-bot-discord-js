import { initApi } from "./apiCall"


export const getUser = async ( userId: string, userType: string ): Promise<any> => {
    try {
        const instance = initApi()
    
        const apiData = await instance.get(
            '/getUser?type=' + userType + '&user=' + userId
        )
        console.log('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        let response = apiData.data
        return response
    }
    catch (err) {
        console.error("getUser()", err)           
    }

}