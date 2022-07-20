import { OreId } from "oreid-js";
import { OreidProvider, useIsLoggedIn, useUser } from "oreid-react";
import { WebPopup } from "oreid-webpopup";
import React, { useEffect, useState } from "react";
import useUrlState from "@ahooksjs/use-url-state"
import { BrowserRouter } from "react-router-dom"


import { Transfer } from "./Transfer"
import "./App.scss";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LoginPage } from "./LoginPage";

// * Initialize OreId
const oreId = new OreId({
	appName: "ORE Tip Bot",
	appId: process.env.REACT_APP_OREID_APP_ID || "",
	oreIdUrl: process.env.OREID_SERVICE_URL || "https://staging.service.oreid.io",
	plugins: {
		popup: WebPopup(),
	},
});

const LoggedInView: React.FC = () => {
	// const user = useUser();
	// if (!user) return null;
	return( <Transfer /> );
};

const AppWithProvider: React.FC = () => {
	const isLoggedIn = useIsLoggedIn();
	return (
		<div className="App">
			<Header />
			{isLoggedIn ? <LoggedInView /> : <LoginPage />}
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