import { Schema, model } from "mongoose"
import { OreIdUser } from "interfaces/OreIdUser"
import { setOreIdUser } from "../modules/mongo"
// import { encryptWithPassword , AesEncryptionOptions, AesEncryptedDataString} from '@open-rights-exchange/chainjs/src/crypto/aesCrypto'
import { logHandler } from "./logHandler"
import * as CryptoJS from 'crypto-js'

const oreIdSchema = new Schema<OreIdUser>({
    discordId: { type: Number, required: true },
    oreId: { type: String, required: false },
    state: { type: String, required: false }
    })

export const OreIdUserModel = model<OreIdUser>('OreIdUser', oreIdSchema)

function toHex(str: string) {
    var result = '';
    for (var i=0; i<str.length; i++) {
      result += str.charCodeAt(i).toString(16)
    }
    return result
}

function fromHex(hex: string){
    let str: string = ''
    try{
      let str = decodeURIComponent(hex.replace(/(..)/g,'%$1'))
    }
    catch(e){
      let str = hex
      console.log('invalid hex input: ' + hex)
    }
    return str
  }

function encrypt(message: string, key: string){
    let encryptedMessage = CryptoJS.AES.encrypt(message, key)
    return toHex(encryptedMessage.toString())
}
function decrypt(message: string, key: string){
    let code = CryptoJS.AES.decrypt(message, key)
    let decryptedMessage = code.toString(CryptoJS.enc.Utf8)

    return decryptedMessage
}

export function createState() {
    const payload: string = new Date().toString()
    const passwordSecret: string = process.env.BOT_SECRET || ''

    let encryptedMessageString: string = encrypt(payload, passwordSecret)
    logHandler.info('encryptedMessageString: ' + encryptedMessageString)
    return encryptedMessageString
}

export function readState(state: string) {
    let fromHexString: string = fromHex(state)
    const passwordSecret: string = process.env.BOT_SECRET || ''
    return decrypt(fromHexString, passwordSecret)
}

export async function setUserState(discordId: string) {
    let setState: string = createState()
    await setOreIdUser(discordId, setState)
    logHandler.info('setState: ' + setState)
}