import { useOreId, useIsLoggedIn } from "oreid-react";
import React, { useEffect, useState } from "react";
import { setLogout } from "../serviceCalls/setLogout";
import useUrlState from "@ahooksjs/use-url-state";

export const LogOut: React.FC = () => {
	const oreId = useOreId()
	const [error, setError] = useState<Error | null>()
    const [state] = useUrlState({
        state: "None"
    })
	let loggedIn = useIsLoggedIn()

    const handleLogOut = async () => {
        let verified: boolean = false
        try {
			verified = await setLogout(state.state)
			// oreId.logout()
		    console.log("Logout successfull.")
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
						.then(() => window.location.replace("/app"))					
				}}
			>
				<span>Unlink</span>
			</button>

			{error && <div className="App-error">Error: {error.message}</div>}
		</section>
	);
};
