import { toEosAsset,
    toEosEntityName,
    toEosSymbol 
} from "@open-rights-exchange/chainjs/dist/chains/eos_2/helpers"
import { EosActionStruct } from "@open-rights-exchange/chainjs/dist/chains/eos_2/models"


export async function createTransferTransaction(
    fromUser: string,
    toUser: string,
    amount: string
    ): Promise<EosActionStruct> {
    // 
    // Compose a transfer transaction action structure
    // 
    const transferTransaction: EosActionStruct = {
        account: toEosEntityName('eosio.token'),
        name: 'transfer',
        authorization: [
            {
                actor: toEosEntityName(fromUser),
                permission: toEosEntityName('active'),
            },
        ],
        data: { 
            from: toEosEntityName(fromUser),
            to: toEosEntityName(toUser),
            quantity:  toEosAsset(amount, toEosSymbol('ORE'), 4),
            memo: "Transfer from ORE Community Bot"
        }
    }

    return transferTransaction
}
