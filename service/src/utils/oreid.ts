import { OreId } from "oreid-js"

export class oreId {
    instance: OreId = new OreId({
        appName: process.env.OREID_APP_NAME || "",
        appId: process.env.OREID_APP_ID || "",
        oreIdUrl: process.env.OREID_URL || "",
    })
    oreEndpoint: { url: string } = {
        url: process.env.CURRENCY_MAINNET || "https://ore.openrights.exchange"
    };

    public async connect(): Promise<OreId> {
        this.instance.init()
        return this.instance
    }
}
