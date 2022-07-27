import useUrlState from "@ahooksjs/use-url-state";
import { AuthProvider, UserData } from "oreid-js";
import { useOreId, useIsLoggedIn, useUser } from "oreid-react";
import React, { useEffect, useState } from "react";
import { checkOreIdLink } from "../serviceCalls/checkOreIdLink";
import { setLogin } from "../serviceCalls/setLogin";
import { setLoginError } from "../serviceCalls/setLoginError";
import styles from "./LoginPage.module.scss";
import LogoEmail from "./logo-email.svg";
import LogoFb from "./logo-fb.svg";
import LogoGoogle from "./logo-google.svg";
import { ReactComponent as Logo } from "./logo.svg";

export const LoginPage: React.FC = () => {
	const oreId = useOreId()
	const [ error, setError ] = useState<Error | null>()
    const [ state, setState ] = useUrlState({
        state: "None",
		loggedIn: false,
		account: "None"
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
		const {available, oreIdLinked} = await checkOreIdLink(user.accountName, state.state)
		console.log(oreIdLinked)
		if (oreIdLinked == "None") { 
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
						setError(err)
					})
				setState({state: state.state, loggedIn: true, account: user.accountName })
				if (window.location.href == "/app/login") {
					window.location.replace("/app/landing")
				}
			}
			console.log("Login successfull. User Data: ", user);
		}
		else {
			if (oreIdLinked === user.accountName) {
				console.log("This account is already linked")
			}
			else if (oreIdLinked !== user.accountName)
				console.log("Linking is Not available, " + oreIdLinked + " is already linked.")
		}
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
					Please Login <br />
					to complete that action{" "}
				</h2>
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
