import { OreId } from "oreid-js";
import { OreidProvider } from "oreid-react";
import { WebPopup } from "oreid-webpopup";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AppProvider } from "./AppProvider";
import "./index.css";
import * as serviceWorker from "./serviceWorker";


const renderApp = () => {
	ReactDOM.render(
		<React.StrictMode>
			<AppProvider>
				<App />
			</AppProvider>
		</React.StrictMode>,
		document.getElementById("root")
	);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
