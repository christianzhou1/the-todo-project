import { useState, useEffect } from "react";
import { authService } from "./services";
import LoginForm from "./components/LoginForm";
import TaskList from "./components/TaskList";
import "./App.css";
import {
  AppBar,
  Box,
  Button,
  CircularProgress, Container,
  createTheme,
  CssBaseline,
  ThemeProvider, Toolbar,
  Typography
} from "@mui/material";


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    }
  }
})

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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.50">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <AppBar position="static" sx={{ backgroundColor: 'grey.800' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Todo App
            </Typography>
            {isAuthenticated && (
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{ backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' } }}
              >
                Logout
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ my: 4 }}>
          {!isAuthenticated ? (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          ) : (
            <TaskList />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
