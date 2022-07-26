
import { HelpersEos } from "@open-rights-exchange/chain-js-plugin-eos"

import { errorLogger, debugLogger } from '../utils/logHandler'


export async function checkAddress(address: string): Promise<[ boolean, string ]> {
    let isValid: boolean = false
    let status: string = "Validating Send Transaction"
    try {
        // check that the address is valid
        const validAddress: boolean = HelpersEos.isValidEosEntityName(address)
        debugLogger('is validAddress: ' + validAddress)
        if (validAddress) {
            isValid = true
            status = address + " is a valid " + process.env.CURRENCY_TOKEN + " address."
        }
        else {
            status = address + " is NOT a valid " + process.env.CURRENCY_TOKEN + " address."
        }
    }
    catch (err) {
        errorLogger("validateSendTxn", err)
    }

    return [isValid, status]
}
