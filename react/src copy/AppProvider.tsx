import React from "react";
import { useState, createContext } from "react";

export const AppContext = createContext<{
	errors: string | undefined;
	setErrors: (errors: string | undefined) => void;
	oreIdResult: string | undefined;
	setOreIdResult: (oreIdResult: string | undefined) => void;
	toAddress: string | undefined;
	setToAddress: (toAddress: string) => void;
	amount: string | undefined
	setAmount: (amount: string) => void
	txType: string | undefined
	setTxType: (txType: string) => void
}>({
	errors: undefined,
	setErrors: () => undefined,
	oreIdResult: undefined,
	setOreIdResult: () => undefined,
	toAddress: "",
	setToAddress: () => undefined,
	amount: "",
	setAmount: () => undefined,
	txType: "",
	setTxType: () => undefined
});

interface Props {}
export const AppProvider: React.FC<Props> = ({ children }) => {
	const [errors, setErrors] = useState<string | undefined>(undefined);
	const [oreIdResult, setOreIdResult] = useState<string | undefined>(undefined);
	const [toAddress, setToAddress] = useState<string | undefined>(undefined)
	const [amount, setAmount] = useState<string | undefined>(undefined)
	const [txType, setTxType] = useState<string| undefined>(undefined)

	return (
		<AppContext.Provider
			value={{
				errors,
				setErrors,
				oreIdResult,
				setOreIdResult,
				toAddress,
				setToAddress,
				amount,
				setAmount,
				txType,
				setTxType
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
