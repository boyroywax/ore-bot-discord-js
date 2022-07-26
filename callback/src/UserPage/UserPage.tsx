import { useOreId, useIsLoggedIn } from "oreid-react";
import React, { useEffect, useState } from "react";
import { setLogout } from "../serviceCalls/setLogout";
import useUrlState from "@ahooksjs/use-url-state";

export const UserPage: React.FC = () => { 
    return (
        <section>
            <div>
                <h3>User Stats will go here!</h3>
            </div>
        </section>
    )
}