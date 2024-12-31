import { Grid } from "@mui/material";
import React, { useState } from "react";
import Webauthn from "./Webauthn.tsx";

interface Props {
    LoggedIn: boolean;
    U2FSupported: boolean;
    WebauthnSupported: boolean;
    setBothUsername(username: string): void;
    setFinalStage(state: boolean): void;
    isSecure: boolean;
    mac: string;
}

const SecurityKey = function(props: Props) {
    const [debugMessage, setDebugMessage] = useState("");

    return (
        <Grid container>
            { props.isSecure && props.WebauthnSupported ? <Webauthn mac={props.mac} setFinalStage={props.setFinalStage} Discoverable={true} loggedIn={props.LoggedIn} setDebugMessage={setDebugMessage} setBothUsername={props.setBothUsername} /> : null }
            <Grid item xs={12}>
                Debug Message: { debugMessage }
            </Grid>
        </Grid>
    );
}

export default SecurityKey;