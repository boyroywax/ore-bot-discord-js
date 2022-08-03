import { getAccount } from "../utils/ore"
import { errorLogger } from "../utils/logHandler"

export const getChainAccount = async ( accountName: string): Promise<{}> => {
    let chainAccount: {} = { result: "None" } 
    try{
        chainAccount = await getAccount(accountName) || { result: "None" }
    }
    catch (error) {
        errorLogger("getChainAccount", error)
    }
    return chainAccount
}