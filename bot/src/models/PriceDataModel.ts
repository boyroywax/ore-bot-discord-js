import { Schema, model } from "mongoose"

import { CmcPriceData } from "../interfaces/PriceData"

// 
// CMC price info
// 
export const priceSchema = new Schema<CmcPriceData>({
    // id: { type: Number, required: false, index: true, default: 0, unique: true, ref: "id" },
    dateCreated: { type: Date, required: true },
    priceUSD: { type: Number, required: true },
    priceBTC: { type: Number, required: true },
    volumeBTC: {type: Number, required: true },
    volumeETH: { type: Number, required: true },
    volumeORE: { type: Number, required: true },
    volumeUSD: { type: Number, required: true },
    volumeChange24h: { type: Number, required: true }

})

export const PriceDataModel = model<CmcPriceData>('PriceData', priceSchema)
