import useUrlState from "@ahooksjs/use-url-state";
import { AuthProvider, UserData } from "oreid-js";
import { useOreId } from "oreid-react";
import React, { useState } from "react";
import { setLogin } from "src/serviceCalls/setLogin";
import { setLoginError } from "src/serviceCalls/setLoginError";
import styles from "./LoginPage.module.scss";
import LogoEmail from "./logo-email.svg";
import LogoFb from "./logo-fb.svg";
import LogoGoogle from "./logo-google.svg";
import { ReactComponent as Logo } from "./logo.svg";

export const LoginPage: React.FC = () => {
	const oreId = useOreId()
	const [ error, setError ] = useState<Error | null>()
    const [ state ] = useUrlState({
        state: "None"
    })

	const onError = async (error: Error) => {
		//
		// Call service and register login failure
		//
		await setLoginError('OreId_login_failed', state.state)
		console.log("OreId login failed ", error)
		setError(error)
	}

	const onSuccess = async ({ user }: { user: UserData }) => {
		//
		// Call Service and register login success
		//
		if ( state.state === "None" ) {
			await setLoginError(`${user.accountName}_state_is_none`, "0")
			setError(({message: "Please login using the Discord bot."}) as Error)
		}
		else if ( user.accountName === undefined ) {
			setError(({message: "Error in LoginPage onSuccess - Please contact support"}) as Error)
		}
		else {
			await setLogin( state.state, user.accountName )
				.catch(async (err) => {
					await setLoginError(`${user.accountName}_Login_cannot_be_updated_in_DB`, state.state)
					setError({message: 'Login cannot be updated in the DB: '} as Error)
				})
		}
		console.log("Login successfull. User Data: ", user);

	};
	const loginWithProvider = (provider: AuthProvider) => {
		oreId.popup
			.auth({
				provider,
			})
			.then(onSuccess)
			.catch(onError);
	};

	return (
		<section className={styles.LoginPage}>
			<div className={styles.logo}>
				<Logo />
			</div>

			<div className={styles.content}>
				<h2>
					Seamless Multi-Chain <br />
					Auth for Web3{" "}
				</h2>
				<p>
					Create a new account or login to ORE ID
					<br />
					using one of the below options.{" "}
				</p>
			</div>

			<button
				className={styles.btnLogin}
				onClick={() => {
					loginWithProvider(AuthProvider.Facebook);
				}}
			>
				<img src={LogoFb} alt="" />
				<span>Facebook</span>
			</button>
			<button
				className={styles.btnLogin}
				onClick={() => {
					loginWithProvider(AuthProvider.Google);
				}}
			>
				<img src={LogoGoogle} alt="" />
				Google
			</button>
			<button
				className={styles.btnLogin}
				onClick={() => {
					loginWithProvider(AuthProvider.Email);
				}}
			>
				<img src={LogoEmail} alt="" />
				Email
			</button>

			{error && <div className="App-error">Error: {error.message}</div>}
		</section>
	);
};
