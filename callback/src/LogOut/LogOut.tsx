import { useOreId, useIsLoggedIn, useUser } from "oreid-react";
import React, { useEffect, useState } from "react";
import { setLogout } from "../serviceCalls/setLogout";
import useUrlState from "@ahooksjs/use-url-state";
import { checkOreIdLink } from "../serviceCalls/checkOreIdLink";

export const LogOut: React.FC = () => {
	const oreId = useOreId()
	const user = useUser()
	const [error, setError] = useState<Error | null>()
    const [state] = useUrlState({
        state: "None"
    })
	let loggedIn = useIsLoggedIn()

    const handleLogOut = async () => {
        let verified: boolean = false
        try {
			const currentUser = user?.accountName || "Error"
			const result = await checkOreIdLink(currentUser, state.state)
			console.log(`${result.available} ${result.oreIdLinked}`)
			if ((loggedIn) && (result.oreIdLinked === currentUser) && result.available) {
				verified = await setLogout(state.state)
				// oreId.logout()
				console.log("Logout successfull.")
				window.location.replace("/app")
			}
			else {
				console.error('handleLogout Failed')
				setError(({message: `${user?.accountName} account cannot logout ${result.oreIdLinked} `} as Error))
			}
        }
        catch (error) {
            console.error(error)
        }
        return verified
    }

	const onError = (error: Error) => {
		//
		// Call service and register login failure
		//
		console.log("Logout failed", error)
		setError(error)
	}

	const onSuccess = async () => {
		//
		// Call Service and register login success
		//
        let verified: boolean = false
        try {
            verified = await setLogout(state.state)
		    console.log("Logout successfull.")
        }
        catch (error) {
            console.error(error)
        }
        return verified
	};

    // useEffect(() => {
    //     try {
    //         handleLogOut()
	// 			.then(() => window.location.replace("/app"))
    //     }
    //     catch(err) {
    //         onError(err as Error)
    //     }
    // })

	return (
		<section>
			<div>
				<h2>
					Unlink your <br />
					ORE ID{" "}
				</h2>
			</div>

			<button
				onClick={() => {
					handleLogOut()
						// .then(() => window.location.replace("/app"))					
				}}
			>
				<span>Unlink</span>
			</button>

			{error && <div className="App-error">Error: {error.message}</div>}
		</section>
	);
};
