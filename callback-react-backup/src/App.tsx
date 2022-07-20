import { useIsLoggedIn, OreidProvider } from "oreid-react";
import { WebPopup } from "oreid-webpopup"
import React, { useContext, useEffect } from "react";
import "./App.css";
import { AppContext } from "./AppProvider";
import { LoggedIn } from "./LoggedIn";
import { LoggedOut } from "./LoggedOut";
import { ShowResultResults } from "./ShowResultResults";
import useUrlState from "@ahooksjs/use-url-state";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { OreId } from "oreid-js";

const App = () => {
    const [state, setState] = useUrlState({ txtype: "transfer", toaddress: "ore1xxxxxxxxx", amount: "0.0000"});
    const isLoggedIn = useIsLoggedIn();
    const { errors, oreIdResult } = useContext(AppContext);

    const oreId: OreId = new OreId({
        appName: "ORE-ID Sample App",
        appId: process.env.REACT_APP_OREID_APP_ID || "",
        oreIdUrl: "https://service.oreid.io",
        plugins: {
            popup: WebPopup(),
        },
    });
    
    useEffect(() => {
        oreId.init()
        .then(() => {
            console.log("OREID is connected")
        })
        .catch((error) => console.log(error));
    }, []);

    return (
        <OreidProvider oreId={oreId}>
            <div>Transaction Type: {state?.txtype}</div>
            <div>To Address: {state?.toaddress}</div>
            <div>Amount: {state?.amount}</div>
            <div>
                <header className="App-header">
                    {isLoggedIn ? <LoggedIn /> : <LoggedOut />}
                    <ShowResultResults result={oreIdResult} />
                    <ShowResultResults result={errors} error />
                </header>
            </div>
        </OreidProvider>
    );
};

export default () => {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/*" element={<App />} />
        </Routes>
        </BrowserRouter>
    );
};
