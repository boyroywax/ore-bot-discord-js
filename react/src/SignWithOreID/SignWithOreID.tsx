import React, { useContext } from "react";
import { useActionSign, useOreId, useUser } from "oreid-react";
import LoginButton from "oreid-login-button";
import { AppContext } from "../AppProvider";
import { createTransferTransaction } from "../helpers/composeTransaction";
import useUrlState from "@ahooksjs/use-url-state"

const algorandChainType = 'ore_test'

// interface Props {
// 	txType: string;
// }
export const SignWithOreID: React.FC = () => {
	const { setErrors, setOreIdResult } = useContext(AppContext);
	const userData = useUser();
	const onSign = useActionSign();
	const oreId = useOreId();
	const [state, setState] = useUrlState({ txtype: "transfer", toaddress: "ore1xxxxxxxxx", amount: "0.0000"});


	if (!userData) return null;

	const handleSign = async () => {
		setErrors(undefined);

		// get first algorand (e.g. algo_test) account in user's wallet
		const signingAccount = userData.chainAccounts.find(
			(ca) => ca.chainNetwork === algorandChainType
		);

		if (!signingAccount) {
			setErrors(
				`User doesnt have any accounts on ${algorandChainType}`
			);
			return;
		}

		const transactionBody = await createTransferTransaction(oreId, signingAccount.chainAccount, state.toaddress, state.amount )

		console.log("transactionBody:", transactionBody);
		if (!transactionBody) {
			setErrors("Transaction cannot be created");
			return;
		}

		const transaction = await oreId.createTransaction({
			chainAccount: signingAccount.chainAccount,
			chainNetwork: signingAccount.chainNetwork,
			//@ts-ignore
			transaction: transactionBody,
			signOptions: {
				broadcast: true,
				returnSignedTransaction: false,
			},
		});

		onSign({
			transaction,
			onError: ({ errors }) => {
				setErrors(errors);
			},
			onSuccess: ({ data }) => {
				setOreIdResult(JSON.stringify(data, null, "\t"));
			},
		});
	};

	return (
		<div className="App-button">
			<LoginButton
				provider="oreid"
				text="Sign with OreID"
				onClick={() => handleSign()}
			/>
		</div>
	);
};
