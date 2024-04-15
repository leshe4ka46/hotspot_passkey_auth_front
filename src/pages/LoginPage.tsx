import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Typography,
  Container,
  IconButton,
  CircularProgress,
  Grid,
} from "@mui/material/";
import { ThemeProvider } from "@mui/material/styles";
import { useThemeContext } from "../utils/ThemeContext";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";

import u2fApi from "u2f-api";
import { logout, login, radiusLogin } from "../services/ClientService.ts";
import {
  isWebauthnSecure,
  isWebauthnSupported,
} from "../services/WebauthnService.ts";
import { getInfo } from "../services/APIService.ts";
import SecurityKey from "../components/SecurityKey.tsx";
const totalTime = 5;
export default function Login() {
  const searchParams = React.useMemo(
    () => new URLSearchParams(document.location.search),
    []
  );
  const { currentTheme, isDarkMode, toggleDarkMode } = useThemeContext();
  const [error, setError] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [errorText, setErrorText] = React.useState("");
  const [mac, setMac] = React.useState("");
  const [interval, setinterv] =
    React.useState<ReturnType<typeof setInterval>>();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [finalStage, setFinalStage] = React.useState(false);
  const [isSecure, setIsSecure] = React.useState(false);
  const [u2fSupported, setU2FSupported] = React.useState(false);
  const [webauthnSupported, setWebauthnSupported] = React.useState(false);
  //const [platformAuthenticator, setPlatformAuthenticator] =
  //React.useState(false);
  React.useEffect(() => {
    (async () => {
      const info = await getInfo();
      if (info && info.username !== "") {
        setUsername(info.username);
        setLoggedIn(true);
        if (!isSecure || !webauthnSupported) {
          radiusLogin();
          setFinalStage(true);
        }
      }
    })();
  }, [setUsername, isSecure,webauthnSupported]);
  const assertionSuccess = (a: string) => {
    setUsername(a);
    setLoggedIn(true);
    setFinalStage(true);
  };
  React.useEffect(() => {
    setIsSecure(isWebauthnSecure());
  }, [setIsSecure]);

  React.useEffect(() => {
    if (finalStage) {
      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        setProgress(prevCounter => {
          if (prevCounter === 100) {
            window.location.replace(searchParams.get("link-orig")!);
          }
          return prevCounter + 1;
        });
        setinterv(interval);
      }, (totalTime * 1000) / 100);
    }
  }, [finalStage, searchParams]);

  React.useEffect(() => {
    setWebauthnSupported(isWebauthnSupported());

    /*(async () => {
      const wpa = await isWebauthnPlatformAuthenticatorAvailable();
      setPlatformAuthenticator(wpa);
    })();*/
  }, [/*setPlatformAuthenticator,*/ setWebauthnSupported]);

  React.useEffect(() => {
    u2fApi.ensureSupport().then(
      () => setU2FSupported(true),
      () => setU2FSupported(false)
    );
  }, [setU2FSupported]);

  React.useEffect(() => {
    setMac(searchParams.get("mac")!);
  }, [searchParams]);

  const handleLoginClick = async () => {
    let mac: string = searchParams.get("mac")!;
    if (username === "" || password === "") {
      setError(true);
      setErrorText("");
    } else {
      setError(false);
      setErrorText("");
    }
    const success = await login(username, password, mac);
    if (success) {
      setUsername(username);
      setError(false);
      setErrorText("");
      setLoggedIn(true);
      if (!isSecure || !webauthnSupported) {
        setFinalStage(true);
        radiusLogin();
      }
    } else {
      setError(true);
      setErrorText("Неверный логин или пароль");
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Grid
          container
          direction="row"
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            textAlign: "center",
          }}>
          <Grid item xs>
            <IconButton
              onClick={() => {
                toggleDarkMode(!isDarkMode);
              }}
              color="inherit">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Grid>
          <Grid item xs={5}></Grid>
          <Grid item xs>
            {loggedIn ? (
              <IconButton
                onClick={async () => {
                  clearInterval(interval);
                  setProgress(0);
                  await logout();
                  setLoggedIn(false);
                  setFinalStage(false);
                  await getInfo();
                }}
                color="inherit">
                <LogoutIcon />
              </IconButton>
            ) : null}
          </Grid>
        </Grid>
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Вход в сеть
          </Typography>
          <Box sx={{ mt: 1 }}>
            {!finalStage ? (
              <Box>
                {!loggedIn ? (
                  <Box>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="login"
                      label="Имя пользователя"
                      name="login"
                      autoComplete="login"
                      autoFocus
                      value={username}
                      error={error}
                      helperText={errorText}
                      onChange={e => {
                        setUsername(e.target.value);
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Пароль"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      error={error}
                      helperText={errorText}
                      onChange={e => {
                        setPassword(e.target.value);
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      onClick={handleLoginClick}>
                      Вход
                    </Button>
                  </Box>
                ) : undefined}
                <SecurityKey
                  mac={mac}
                  setFinalStage={setFinalStage}
                  U2FSupported={u2fSupported}
                  WebauthnSupported={webauthnSupported}
                  LoggedIn={loggedIn}
                  setBothUsername={assertionSuccess}
                  isSecure={isSecure}
                />
              </Box>
            ) : (
              <CircularProgress variant="determinate" value={progress} />
            )}
          </Box>
        </Box>
        <Grid
          container
          direction="column"
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            textAlign: "center",
            mb: 0,
          }}>
          <Grid item>
            <Typography variant="caption" color="grey">
              App commit hash: {process.env.REACT_APP_VERSION}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
