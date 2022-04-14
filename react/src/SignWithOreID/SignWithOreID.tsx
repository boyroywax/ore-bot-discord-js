import React, { useContext } from "react";
import { useActionSign, useOreId, useUser } from "oreid-react";
import LoginButton from "oreid-login-button";
import { AppContext } from "../AppProvider";
import { createTransferTransaction } from "../helpers/composeTransaction";
import useUrlState from "@ahooksjs/use-url-state"
import { MongoClient } from "../helpers/mongo";
import { logHandler } from "../helpers/logHandler";
import { DiscordUserModel } from "../models/DiscordUserModel";
import { DiscordUser } from "../interfaces/DiscordUser";

const oreChainType = 'ore_test'

// interface Props {
// 	txType: string;
// }
export const SignWithOreID: React.FC = () => {
	const { setErrors, setOreIdResult } = useContext(AppContext);
	const userData = useUser();
	const onSign = useActionSign();
	const oreId = useOreId();
	const [ state ] = useUrlState({
		state: "None",
		txtype: "transfer",
		toaddress: "ore1xxxxxxxxx",
		amount: "0.0000"
	})
	const mongoClient: MongoClient =  new MongoClient()

	if (!userData) return null;

	const handleSign = async () => {
		setErrors(undefined);

		if (state.state !== "0001") {
			const discordUser: DiscordUser = await mongoClient.getUser(state.state)

			if (discordUser.oreId !== userData.accountName) {
				setErrors(
					`User did not request the transaction`
				)
				return
			}
		}
		
		// get first algorand (e.g. algo_test) account in user's wallet
		const signingAccount = userData.chainAccounts.find(
			(ca) => ca.chainNetwork === oreChainType
		)

		if (!signingAccount) {
			setErrors(
				`User doesn not have any accounts on ${oreChainType}`
			)
			return
		}


		// const transactionBody = await createTransferTransaction(
		// 	signingAccount.chainAccount,
		// 	state.toaddress,
		// 	state.amount 
		// Compose transaction contents
		// const transactionBody = await composeSampleTransactionAlgorand({
		// 	chainAccount: signingAccount.chainAccount,
		// 	txType,
		// 	toAddress,
		// });

		const transactionBody = await createTransferTransaction(signingAccount.chainAccount, state.toaddress, state.amount )

		console.log("transactionBody:", transactionBody)
		if (!transactionBody) {
			setErrors("Transaction cannot be created")
			return
		}

		// * To sign a transaction we have two options!!!
		// const createTransaction = false;
		// if (createTransaction) {
			//  * We can let the onSign function to create a transaction (without using oreId directly)
		// 	onSign({
		// 		createTransaction: {
		// 			transactionData: {
		// 				chainAccount: signingAccount.chainAccount,
		// 				chainNetwork: signingAccount.chainNetwork,
		// 				//@ts-ignore
		// 				transaction: transactionBody,
		// 			},
		// 			signOptions: {
		// 				broadcast: true,
		// 				returnSignedTransaction: false,
		// 			},
		// 		},
		// 		onError: ({ errors }) => {
		// 			setErrors(errors);
		// 		},
		// 		onSuccess: ({ data }) => {
		// 			setOreIdResult(JSON.stringify(data, null, "\t"));
		// 		},
		// 	});
		// } else {
		// * Or we can create the transaction manually (using oreId directly)
		const transaction = await oreId.createTransaction({
			chainAccount: signingAccount.chainAccount,
			chainNetwork: signingAccount.chainNetwork,
			//@ts-ignore
			transaction: transactionBody,
			signOptions: {
				broadcast: true,
				returnSignedTransaction: false,
			},
		})

		onSign({
			transaction,
			onError: ({ errors }) => {
				setErrors(errors);
			},
			onSuccess: ({ data }) => {
				setOreIdResult(JSON.stringify(data, null, "\t"));
			},
		})
	}

	return (
		<div className="App-button">
			<LoginButton
				provider="google"
				text="Sign with OreID"
				onClick={() => handleSign()}
			/>
		</div>
	)
}
