import { Schema, model } from "mongoose"
import { OreIdUser } from "interfaces/OreIdUser"

export const oreIdSchema = new Schema<OreIdUser>({
    dateCreated: {type: Date, required: false },
    discordId: { type: Number, required: true },
    lastLogin: {type: Date, required: false },
    loggedIn: {type: Boolean, required: true },
    oreId: { type: String, required: false },
    state: { type: String, required: false, ref: 'state'}
    })

export const OreIdUserModel = model<OreIdUser>('OreIdUser', oreIdSchema)