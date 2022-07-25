import { debugLogger } from "./logHandler"
import * as CryptoJS from 'crypto-js'


function fromHex(hex: string){
    let str: string = ''
    try{
      let str = decodeURIComponent(hex.replace(/(..)/g,'%$1'))
    }
    catch(e){
      let str = hex
      debugLogger('invalid hex input: ' + hex + "\nerror: " + e)
    }
    return str
  }

function decrypt(message: string, key: string){
    let code = CryptoJS.AES.decrypt(message, key)
    let decryptedMessage = code.toString(CryptoJS.enc.Utf8)

    return decryptedMessage
}

export function readState(state: string) {
    let fromHexString: string = fromHex(state)
    const passwordSecret: string = process.env.BOT_SECRET || ''
    return decrypt(fromHexString, passwordSecret)
}
