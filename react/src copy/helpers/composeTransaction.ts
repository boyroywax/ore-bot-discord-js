import { toEosAsset, toEosEntityName, toEosSymbol } from "@open-rights-exchange/chainjs/dist/chains/eos_2/helpers"
import { EosActionStruct } from "@open-rights-exchange/chainjs/dist/chains/eos_2/models"
import { TransactionOptions } from "@open-rights-exchange/chainjs/dist/models"
import { AuthProvider, ChainNetwork, OreId, Transaction, TransactionSignOptions } from "oreid-js"

// import { oreId } from "../helpers/oreid"


const signOptions: TransactionSignOptions = {
	provider: AuthProvider.OreId, // wallet type (e.g. 'algosigner' or 'oreid')
	broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
	state: 'abc', // anything you'd like to remember after the callback
	returnSignedTransaction: false,
	preventAutosign: false, // prevent auto sign even if transaction is auto signable
}

export async function createTransferTransaction(oreId: OreId, fromUser: string, toUser: string, amount: string): Promise<Transaction> {
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
            quantity:  toEosAsset(String(amount), toEosSymbol('ORE'), 4),
            memo: "Transfer from ORE Community Bot"
        }
    }

	let transactionData: TransactionOptions =  {
		chainAccount: toEosEntityName(fromUser),
		chainNetwork: ChainNetwork.OreTest,
		transaction: transferTransaction,
		signOptions: signOptions,
	}
	if (process.env.REACT_APP_CURRENCY_STAGE === "mainnet") {
		transactionData =  {
			chainAccount: toEosEntityName(fromUser),
			chainNetwork: ChainNetwork.OreMain,
			transaction: transferTransaction,
			signOptions: signOptions,
		}
	}

    const transaction = await oreId.createTransaction(transactionData) 
    if (transaction) {
        console.log(await transaction.getSignUrl())
    }

    return transaction
}
