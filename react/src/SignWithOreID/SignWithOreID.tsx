import React, { useContext } from "react";
import { useActionSign, useOreId, useUser } from "oreid-react";
import LoginButton from "oreid-login-button";

import { AppContext } from "../AppProvider";
import { createTransferTransaction } from "../helpers/composeTransaction";
import { ChainNetwork } from "oreid-js";

interface Props {
	txType: string;
	toUser: string
	amount: string
}
export const SignWithOreID: React.FC<Props> = ({ 
	txType,
	toUser,
	amount
}) => {
	const { setErrors, setOreIdResult } = useContext(AppContext);
	const userData = useUser();
	const onSign = useActionSign();
	const oreId = useOreId();

	if (!userData) return null;

	const handleSign = async () => {
		setErrors(undefined);

		// get first ore (e.g. ore_test) account in user's wallet
		const signingAccount = userData.chainAccounts.find(
			(ca) => ca.chainNetwork === ChainNetwork.OreTest
		);

		if (!signingAccount) {
			setErrors(
				`User doesnt have any accounts on ${ChainNetwork.OreTest}`
			);
			return;
		}

		if ( txType !== "transfer" ){ 
			setErrors(
				`User can only make a send transaction`
			)
			return
		}

		// Compose transaction contents
		const transaction = await createTransferTransaction(
			oreId,
			signingAccount.chainAccount,
			toUser,
			amount
		)

		console.log("transactionBody:", transaction);
		if (!transaction) {
			setErrors("Transaction cannot be created");
			return;
		}

		//  * We can let the onSign function to create a transaction (without using oreId directly)
		onSign({
			transaction,
			onError: ({ errors }) => {
				setErrors(errors);
			},
			onSuccess: ({ data }) => {
				setOreIdResult(JSON.stringify(data, null, "\t"));
			},
		});
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