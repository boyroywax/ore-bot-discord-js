import { initApi } from "./apiCall"


export const deleteCase = async ( caseNum: number ): Promise<boolean> => {
    let response: boolean = false
    try {
        const instance = initApi()
    
        const apiData = await instance.post(
            '/proposal?case=' + String( caseNum )  , {
                "action": "delete"
            }
        )
        console.log('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        response = apiData.data
    }
    catch (err) {
        console.error("deleteCase()", err)           
    }
    return response
}