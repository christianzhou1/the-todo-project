import { useState, useEffect } from "react";
import { authService } from "./services";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import "./App.css";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#121212",
      paper: "#0f0f0f",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar position="static" sx={{ backgroundColor: "background.paper" }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Todo App
            </Typography>
            {isAuthenticated && (
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  backgroundColor: "error.main",
                  "&:hover": { backgroundColor: "error.dark" },
                }}
              >
                Logout
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            p: 2,
          }}
        >
          {!isAuthenticated ? (
            <Container
              maxWidth="sm"
              sx={{ height: "100%", display: "flex", alignItems: "center" }}
            >
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            </Container>
          ) : (
            <Dashboard />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
