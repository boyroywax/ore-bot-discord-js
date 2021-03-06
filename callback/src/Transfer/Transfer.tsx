import React, { useContext, useState, useEffect } from "react";
import { useOreId, useUser } from "oreid-react";
import LoginButton from "oreid-login-button";
import useUrlState from "@ahooksjs/use-url-state"
import { ChainNetwork, JSONObject, PopupPluginSignParams, Transaction, TransactionData, UserData } from "oreid-js";
import styles from "./Transfer.module.scss"
import { setSigned } from "../serviceCalls/setSigned";

// interface Props {
// 	txType: string;
// }
export const Transfer: React.FC = () => {
	const[ txnId, setTxnId ] = useState("")
	const user = useUser()
	const oreId = useOreId()
	const [ state, setState ] = useUrlState({
		state: "None",
		txtype: "transfer",
		toaddress: "ore1xxxxxxxxx",
		amount: "0.0000"
	})
    const [ errors, setErrors ] = useState("")

	// const checkRequestedTxn = async () => {

	// 	// if (state.state !== "0001") {
	// 	// 	const discordUser: DiscordUser = await mongoClient.getUser(state.state)
	
	// 	// 	if (discordUser.oreId !== user?.accountName) {
	// 	// 		setErrors(
	// 	// 			`User did not request the transaction`
	// 	// 		)
	// 	// 		return ("User did not request the transaction")
	// 	// 	}
	// 	// }
	// }

	// useEffect( () => {
	// 	// checkRequestedTxn()
	// })

	// if (!user) {
	// 	setErrors("User undefined");
	// }

    const onError = ( error: Error ) => {
        console.log("Transaction failed ", error);
        // setErrors( error.message );
    };

    const onSuccess = async ( result: any ) => {
        await setSigned(state.state, state.toaddress)
        console.log( 
            "Transaction Successful. ", JSON.stringify(result)
        );
        setTxnId(result.transactionId);
    };

    const handleSign = async () => {

        let chainNetwork: ChainNetwork = ChainNetwork.OreMain

        console.log(process.env.REACT_APP_CURRENCY_STAGE || 'none')

        if ( process.env.REACT_APP_CURRENCY_STAGE === 'testnet') {
            chainNetwork = ChainNetwork.OreTest
        }

        const signingAccount = user?.chainAccounts.find(
            (ca) => ca.chainNetwork === chainNetwork
        );

        console.log(signingAccount)
    
        const errorMsg = `User does not have any accounts on ${chainNetwork}`;
    
        if (!signingAccount) {
            console.log(errorMsg)        
        };

        console.log(signingAccount)
    
        const transactionAction: JSONObject = {
            account: "eosio.token",
            name: "transfer",
            authorization: [
                {
                    actor: signingAccount?.chainAccount || "",
                    permission: "active"
                }
            ],
            data: {
                from: signingAccount?.chainAccount || "",
                to: state.toaddress || "",
                quantity: state.amount + " ORE",
                memo: "Transfer from ORE COmmunity Bot"
            }
        };

        const transactionData = { actions: [transactionAction] }

        const transaction: Transaction = await oreId.createTransaction({
            chainAccount: signingAccount?.chainAccount,
            chainNetwork: chainNetwork,
            transaction: transactionData,
            signOptions: {
                broadcast: true,
                returnSignedTransaction: false,
            },
        });

        const popuUpParams : PopupPluginSignParams = {
            transaction: transaction
        }

        console.log(transaction)

		oreId.popup
			.sign(popuUpParams)
			.then( onSuccess )
			.catch( onError )
	}

	return (
        <section className={styles.Transfer}>
            <div>
                <button
                    className={styles.btnTransfer}
                    onClick={() => { handleSign();}}
                >
                        Sign Transaction
                </button>
                <h3>Amount: {state?.amount}</h3>
                {/* <h3>{state?.state}</h3> */}
                <h3>To: {state?.toaddress}</h3>
                {/* <h3>{state?.txtype}</h3> */}
            </div>
        </section>
	)
}
