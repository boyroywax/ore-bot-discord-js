import { initApi } from "./apiCall"


export const getAccount = async ( oreAccount: string ): Promise<any> => {
    let response: any = "Loading"
    try {
        const instance = initApi()
    
        const apiData = await instance.get(
            '/account?name=' + String( oreAccount ) 
        )
        console.log('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        response = apiData.data
    }
    catch (err) {
        console.error("getActivity()", err)           
    }
    return response
}