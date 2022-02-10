import { Schema, model } from "mongoose"
import { OreIdUser } from "interfaces/OreIdUser"

export const oreIdSchema = new Schema<OreIdUser>({
    discordId: { type: Number, required: true },
    loggedIn: {type: Boolean, required: true},
    lastLogin: {type: Date, requiredPaths: true},
    oreId: { type: String, required: false },
    state: { type: String, required: false, ref: 'state'}
    })

export const OreIdUserModel = model<OreIdUser>('OreIdUser', oreIdSchema)