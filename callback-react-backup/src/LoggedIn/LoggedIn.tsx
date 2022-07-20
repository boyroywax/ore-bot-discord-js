import React from "react";
import { useOreId, useUser } from "oreid-react";
import { SignWithOreID } from "../SignWithOreID";
import { UserInfo } from "../UserInfo";

export const LoggedIn: React.FC = () => {
	const oreId = useOreId()
	const onLogout = () => {
		oreId.logout()
	}
	
	const user = useUser();
	if (!user) return null;

	return (
		<div className="LoggedIn">
			<div style={{ marginTop: 50, marginLeft: 40 }}>
				<UserInfo />
				<br />
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
