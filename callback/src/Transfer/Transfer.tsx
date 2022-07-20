import React, { useContext, useState, useEffect } from "react";
import { useOreId, useUser } from "oreid-react";
import LoginButton from "oreid-login-button";
import useUrlState from "@ahooksjs/use-url-state"
import { ChainNetwork, JSONObject, Transaction, TransactionData, UserData } from "oreid-js";
import styles from "./Transfer.module.scss"

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

	// const checkRequestedTxn = async () => {
	// 	const mongoClient: MongoClient =  new MongoClient()

	// 	if (state.state !== "0001") {
	// 		const discordUser: DiscordUser = await mongoClient.getUser(state.state)
	
	// 		if (discordUser.oreId !== user?.accountName) {
	// 			setErrors(
	// 				`User did not request the transaction`
	// 			)
	// 			return ("User did not request the transaction")
	// 		}
	// 	}
	// }

	// useEffect( () => {
	// 	checkRequestedTxn()
	// })

	// if (!user) {
	// 	setErrors("User undefined");
	// }

    const onError = ( error: Error ) => {
        console.log("Transaction failed ", error);
        // setErrors( error.message );
    };

    const onSuccess = ( result: any ) => {
        console.log( 
            "Transaction Successful. ", JSON.stringify(result)
        );
        setTxnId(result.transactionId);
    };

    const handleSign = async () => {

        let chainNetwork: ChainNetwork

        console.log(process.env.REACT_APP_CURRENCY_STAGE || 'none')

        if ( process.env.REACT_APP_CURRENCY_STAGE === 'testnet') {
            chainNetwork = ChainNetwork.OreTest
        }
        else {
            chainNetwork = ChainNetwork.OreMain
        }

        console.log('Chainnetwrok')
        console.log(user)

        const signingAccount = user?.chainAccounts.find(
            (ca) => ca.chainNetwork ===  "ore_test"
        );

        console.log(signingAccount)
    
        const errorMsg = `User does not have any accounts on ${chainNetwork}`;
    
        if (!signingAccount) {
            console.log(errorMsg)        };

        console.log(signingAccount)
    
        const transactionBody: JSONObject = {
            from: signingAccount?.chainAccount || "",
            to: signingAccount?.chainAccount || "",
            value: 0
        };

        const transaction: Transaction = await oreId.createTransaction({
            chainAccount: signingAccount?.chainAccount,
            chainNetwork: chainNetwork,
            transaction: transactionBody,
            signOptions: {
                broadcast: true,
                returnSignedTransaction: false,
            },
        });

		oreId.popup
			.sign({ transaction })
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
                <h3>{state?.amount}</h3>
                <h3>{state?.state}</h3>
                <h3>{state?.toaddress}</h3>
                <h3>{state?.txtype}</h3>
            </div>
        </section>
	)
}
