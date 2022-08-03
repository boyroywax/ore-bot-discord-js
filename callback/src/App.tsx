import { OreId } from "oreid-js";
import { OreidProvider, useIsLoggedIn, useUser } from "oreid-react";
import { WebPopup } from "oreid-webpopup";
import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom"
import { Routes, Route } from "react-router"

import { Transfer } from "./Transfer"
import "./App.scss";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LoginPage } from "./LoginPage";
import { LogOut } from "./LogOut";
import { Landing } from "./Landing";
import { AutoLogin } from "./AutoLogin/AutoLogin";
import { UserPage } from "./UserPage";
import { Nav } from "./Nav";
import { CastVote } from "./Vote/CastVote";


// dotenv.config()
// * Initialize OreId
const oreId = new OreId({
	appName: "ORE Tip Bot",
	appId: process.env.REACT_APP_OREID_APP_ID || "",
	oreIdUrl: process.env.REACT_APP_OREID_SERVICE_URL || "https://staging.service.oreid.io",
	plugins: {
		popup: WebPopup(),
	},
});

const LoggedInView: React.FC = () => {
	const user = useUser() || null
	return(
		<>
		<Routes>
			<Route path="/app" element={<UserPage user={user}/>} />
			<Route path="/app/login" element={<AutoLogin />} />
			<Route path="/app/landing" element={<Landing />} />
			<Route path="/app/sign" element={<Transfer />} />
			<Route path="/app/logout" element={<LogOut />} />
			<Route path="/app/vote" element={<CastVote user={user} />} />
		</Routes>
		</>
	)
}

const AppWithProvider: React.FC = () => {
	const isLoggedIn = useIsLoggedIn();
	return (
		<div className="App">
			<Header />
			{isLoggedIn ? 
				<div>
					<Nav />
					<LoggedInView />
				</div>
			 : <LoginPage />}
			<Footer />
		</div>
	);
};

export const App: React.FC = () => {
	const [oreidReady, setOreidReady] = useState(false);

	useEffect(() => {
		oreId.init().then(() => {
			setOreidReady(true);
		});
	}, []);

	if (!oreidReady) {
		return <>Loading...</>;
	}

	return (
		<>
		<BrowserRouter>
			<OreidProvider oreId={ oreId }>
				<AppWithProvider />
			</OreidProvider>
		</BrowserRouter>
		</>
	);
};
