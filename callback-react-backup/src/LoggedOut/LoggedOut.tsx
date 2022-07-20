import React from "react";
import { useState } from "react";
import { AuthProvider, UserData } from "oreid-js";
import { useOreId } from "oreid-react";
import { logHandler } from "../helpers/logHandler";


export const LoggedOut = () => {
	const oreId = useOreId();
	const [error, setError] = useState<Error | null>();

	const onError = ( error: Error ) => {
		logHandler.info("Login failed", error);
		setError(error);
	};

	const onSuccess = ({ user }: { user: UserData } ) => {
		logHandler.info("Login successfull. User Data: ", user);
	};
    
	const loginWithProvider = (provider: AuthProvider) => {
		oreId.popup
			.auth({
				provider,
			})
			.then( onSuccess )
			.catch( onError );
	};

	return (
        <div>
			<button
				onClick={() => {
					loginWithProvider(AuthProvider.Google);
				}}
			>
				Google
			</button>
			<button
				onClick={() => {
					loginWithProvider(AuthProvider.Email);
				}} 
            >
				Email
			</button>

			{error && <div>Error: {error.message}</div>}
        </div>
	);
};