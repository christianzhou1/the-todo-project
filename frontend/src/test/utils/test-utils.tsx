import React from "react";
import type { ReactElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
      dark: "#1976d2",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f48fb1",
      dark: "#c2185b",
      contrastText: "#ffffff",
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

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render, screen, waitFor };

