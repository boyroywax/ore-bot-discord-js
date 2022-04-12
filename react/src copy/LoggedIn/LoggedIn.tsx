import React from "react";
import { useActionLogout, useUser } from "oreid-react";
// import { SelectTxType } from "../SelectTxType";
import { SignWithOreID } from "../SignWithOreID";
import { UserInfo } from "../UserInfo"

// interface Props {
// 	txType: string
// 	toUser: string
// 	amount: string
// }

export const LoggedIn: React.FC = () => {
	// const [txType] = useState("type");
	// const [toUser] = useState("touser")
	// const [amount] = useState("amount")

	const onLogout = useActionLogout();
	const user = useUser();
	if (!user) return null;

	return (
		<div className="LoggedIn">
			<div style={{ marginTop: 50, marginLeft: 40 }}>
				<UserInfo />
				<br />
				<SignWithOreID />
				<br />
				<button
					onClick={() => {
						onLogout();
					}}
				>
					Logout
				</button>
			</div>
		</div>
	);
};
