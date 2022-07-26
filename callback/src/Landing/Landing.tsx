import useUrlState from "@ahooksjs/use-url-state";
import { UserData } from "oreid-js";
import { useOreId, useIsLoggedIn, useUser } from "oreid-react";
import React, { useEffect, useState } from "react";
import { setLogin } from "../serviceCalls/setLogin";
import { setLoginError } from "../serviceCalls/setLoginError";

export const Landing: React.FC = () => {
	const oreId = useOreId()
	const [ error, setError ] = useState<Error | null>()
    const [ state, setState ] = useUrlState({
        state: "None"
    })
	const loggedIn: boolean = useIsLoggedIn()
	const user = useUser()

	return (
		<section>
			<div>
				<h2>
					Welcome to your friendly ORE Community Bot{" "}
				</h2>
            </div>
        </section>
	);
};
