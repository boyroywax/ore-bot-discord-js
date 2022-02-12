import { logHandler } from "./logHandler"
import * as CryptoJS from 'crypto-js'


function toHex(str: string): string{
    // 
    // Converts the encrypted message to a hex string
    // 
    var result: string = ''
    for (var i=0; i<str.length; i++) {
      result += str.charCodeAt(i).toString(16)
    }
    return result
}

function fromHex(hex: string): string{
    // 
    // Converts from a hex string to an encrypted message
    // 
    let str: string = ''
    try{
      let str = decodeURIComponent(hex.replace(/(..)/g,'%$1'))
    }
    catch(error){
      logHandler.error('Invalid hex input: ' + hex)
    }
    return str
  }

function encrypt(message: string, key: string): string{
    // 
    // AES encrypts a <message> using the <key>
    // Returns an ecrypted hex string
    // 
    let encryptedMessage = CryptoJS.AES.encrypt(message, key)
    return toHex(encryptedMessage.toString())
}

function decrypt(message: string, key: string): string{
    // 
    // AES decrypt a <message> using the <key>
    // Returns a decrypted from an encrypted hex string
    // 
    let code = CryptoJS.AES.decrypt(message, key)
    let decryptedMessage = code.toString(CryptoJS.enc.Utf8)
    return decryptedMessage
}

export function createState(payload: Date): string{
    // 
    // Returns the hex encoded state
    // 
    const passwordSecret: string = process.env.BOT_SECRET || ''

    let encryptedMessageString: string = encrypt(payload.toString(), passwordSecret)
    logHandler.info('encryptedMessageString: ' + encryptedMessageString)
    return encryptedMessageString
}

export function readState(state: string): string{
    // 
    // Returns the decrypted state
    // 
    let fromHexString: string = fromHex(state)
    const passwordSecret: string = process.env.BOT_SECRET || ''
    return decrypt(fromHexString, passwordSecret)
}
