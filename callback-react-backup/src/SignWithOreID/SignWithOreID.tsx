import React, { useContext, useState, useEffect } from "react";
import { useOreId, useUser } from "oreid-react";
import LoginButton from "oreid-login-button";
import { AppContext } from "../AppProvider";
import useUrlState from "@ahooksjs/use-url-state"
import { MongoClient } from "../helpers/mongo";
import { logHandler } from "../helpers/logHandler";
import { DiscordUserModel } from "../models/DiscordUserModel";
import { DiscordUser } from "../interfaces/DiscordUser";
import { ChainNetwork, Transaction, TransactionData } from "oreid-js";

const oreChainType = 'ore_test'

// interface Props {
// 	txType: string;
// }
export const SignWithOreID: React.FC = () => {
	const { setErrors, setOreIdResult } = useContext(AppContext)
	const[ txnId, setTxnId ] = useState("")
	const user = useUser()
	const oreId = useOreId()
	const [ state ] = useUrlState({
		state: "None",
		txtype: "transfer",
		toaddress: "ore1xxxxxxxxx",
		amount: "0.0000"
	})

	const checkRequestedTxn = async () => {
		const mongoClient: MongoClient =  new MongoClient()

		if (state.state !== "0001") {
			const discordUser: DiscordUser = await mongoClient.getUser(state.state)
	
			if (discordUser.oreId !== user?.accountName) {
				setErrors(
					`User did not request the transaction`
				)
				return ("User did not request the transaction")
			}
		}
	}

	useEffect( () => {
		checkRequestedTxn()
	})

	if (!user) {
		setErrors("User undefined");
	}

	let chainNetwork: ChainNetwork

	if ( process.env.CURRENCY_STAGE === 'testnet') {
		chainNetwork = ChainNetwork.OreTest
	}
	else {
		chainNetwork = ChainNetwork.OreMain
	}


    const onError = ( error: Error ) => {
        logHandler.info("Transaction failed ", error);
        setErrors( error.message );
    };

    const onSuccess = ( result: any ) => {
        console.log( 
            "Transaction Successful. ", JSON.stringify(result)
        );
        setTxnId(result.transactionId);
    };

    const handleSign = async () => {
        const signingAccount = user?.chainAccounts.find(
            (ca) => ca.chainNetwork ===  chainNetwork
        );
    
        const errorMsg = `User does not have any accounts on ${chainNetwork}`;
    
        if (!signingAccount) {
			setErrors( errorMsg )
            return ( errorMsg );
        };
    
        const transactionBody = {
            from: signingAccount.chainAccount,
            to: signingAccount.chainAccount,
            value: 0
        };

        const transaction: Transaction = await oreId.createTransaction({
            chainAccount: signingAccount.chainAccount,
            chainNetwork: signingAccount.chainNetwork,
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
		<div className="App-button">
			<LoginButton
				provider="oreid"
				text="Sign with OreID"
				onClick={() => handleSign()}
			/>
		</div>
	)
}
