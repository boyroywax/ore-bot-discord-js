
import { AuthProvider, ChainNetwork, TransactionData, TransactionSignOptions } from 'oreid-js'
// import { toEosAsset, toEosEntityName, toEosSymbol } from '@open-rights-exchange/chainjs/dist/chains/eos_2/helpers'
// import { EosActionStruct } from '@open-rights-exchange/chainjs/dist/chains/eos_2/models'

//  let user: UserSourceData | undefined = await callApiGetUser(oreId2, {account: toEosEntityName(fromUser)})
 // const oreAccount = oreId2.auth.user.data.chainAccounts.find(ca => ca.chainNetwork === "ore_main")
 // let userInfo = await oreId2.callOreIdApi(RequestType.Get, ApiEndpoint.GetUser, {"account": fromUser} )
 // logHandler.info(JSON.stringify(userInfo))
 // await userInfo.getData()
 // if (oreAccount) {

//  export async function composeOreTransaction (
//      fromUser: string,
//      toUser: string,
//      amount: number
//  ): Promise<TransactionData> {
//     const transferTransaction: EosActionStruct = {
//      account: toEosEntityName('eosio.token'),
//      name: 'transfer',
//      authorization: [
//          {
//              actor: toEosEntityName(fromUser),
//              permission: toEosEntityName('active'),
//          },
//      ],
//      data: { 
//          from: toEosEntityName(fromUser),
//          to: toEosEntityName(toUser),
//          quantity:  toEosAsset(String(amount), toEosSymbol('ORE'), 8),
//          memo: "Transfer from ORE Community Bot"
//      }
//     }
 
//     const signOptions: TransactionSignOptions = {
//         provider: AuthProvider.OreId, // wallet type (e.g. 'algosigner' or 'oreid')
//         broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
//         state: 'abc', // anything you'd like to remember after the callback
//         returnSignedTransaction: false,
//         callbackUrl: process.env.OREID_SIGN_CALLBACK_URL,
//         preventAutosign: false, // prevent auto sign even if transaction is auto signable
//     }

//     const transactionData: TransactionData =  {
//         account: toEosEntityName('eosio.token'),
//         chainAccount: toEosEntityName(fromUser),
//         chainNetwork: ChainNetwork.OreTest,
//         transaction: transferTransaction,
//         signOptions: signOptions,
//     }

//     return transactionData
// }

export async function composeOreTransactionNoChainJs (
    fromUser: string,
    toUser: string,
    amount: number
): Promise<TransactionData> {
    const authorization = {
        actor: fromUser,
        permission: 'owner',
    };

    const transferTransaction = {
        account: "eosio.token",
        name: "transfer",
        authorization: [authorization],
        data: { 
            from: fromUser,
            to: toUser,
            quantity:  String(amount) + " ORE",
            memo: "Transfer from ORE Community Bot"
        }
    };

    const authorization_object = {
        threshold: 1,
        accounts: [{
            permission: {
                actor: fromUser,
                permission: "active"
            },
            weight: 1
        }],
        keys: [{
            key: "EOS725RKpd7EPM8NYtEV9qNqi7Fpgc5eZgYM5Muqj4oKSSAyXNbFH",
            weight: 1
        }],
        waits: []
    };

    const updateauth_input = {
        account: fromUser,
        permission: "ore_bot",
        parent: "owner",
        auth: authorization_object
    };

    const optIntoOreTransfers = {
        account: "eosio",
        name: "updateauth",
        authorization: [
            {
                actor: fromUser,
                permission: "active"
            }
        ],
        // data: Buffer.from(JSON.stringify(updateauth_input), "utf8").toString('hex')
        data: updateauth_input
    };

    const signOptions = {
        provider: AuthProvider.OreId, // wallet type (e.g. 'algosigner' or 'oreid')
        broadcast: true, // if broadcast=true, ore id will broadcast the transaction to the chain network for you
        state: 'abc', // anything you'd like to remember after the callback
        returnSignedTransaction: false,
        callbackUrl: process.env.OREID_SIGN_CALLBACK_URL,
        preventAutosign: false, // prevent auto sign even if transaction is auto signable
    }

//    const transactionData: TransactionData =  {
//        account: 'eosio.token',
//        chainAccount: fromUser,
//        chainNetwork: ChainNetwork.OreTest,
//        transaction: transferTransaction,
//        signOptions: signOptions,
//    }

   const transactionData: TransactionData =  {
    account: 'eosio',
    chainAccount: fromUser,
    chainNetwork: ChainNetwork.OreTest,
    transaction: optIntoOreTransfers,
    signOptions: signOptions,
}

   return transactionData
}
