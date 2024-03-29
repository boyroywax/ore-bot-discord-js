import useUrlState from "@ahooksjs/use-url-state";
import { UserData } from "oreid-js";
import { useOreId, useIsLoggedIn, useUser } from "oreid-react";
import React, { useEffect, useState } from "react";
import { checkOreIdLink } from "src/serviceCalls/checkOreIdLink";
import { setLogin } from "../serviceCalls/setLogin";
import { setLoginError } from "../serviceCalls/setLoginError";

export const AutoLogin: React.FC = () => {
	const oreId = useOreId()
	const [ error, setError ] = useState<Error | null>()
    const [ state, setState ] = useUrlState({
        state: "None",
		loggedIn: false
    })
	const loggedIn: boolean = useIsLoggedIn()
	const user = useUser()

	useEffect(() => {
		if (!state.loggedIn) {
			if (loggedIn) {
				if (user != undefined) {
					checkOreIdLink(user.accountName, state.state).then(({available, oreIdLinked}) => { 
						if (oreIdLinked === "None") {
							onSuccess({user})
								.then(() => {
									window.location.replace("/app/landing")
									setState({state: "0", loggedIn: true})
								})
						}
					})
					.catch((err) => console.log(err))
				}
			}
		}
		else {
			window.location.replace("/app")
		}
	})

	const onSuccess = async ({ user }: { user: UserData }) => {
		//
		// Call Service and register login success
		//
		const loginSet = await setLogin( state.state, user.accountName )
			.catch(async (err) => {
				await setLoginError(`${user.accountName}_Login_cannot_be_updated_in_DB`, state.state)
				setError(err)
			})
		console.log(loginSet)
		console.log("Login successfull. User Data: ", user);

	};

	return (
		<section>
			<div>
				<h2>
					Automatically logging you in...
				</h2>
            </div>
        </section>
	);
};
