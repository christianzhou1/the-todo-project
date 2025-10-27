import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from "@mui/material";
import { ExpandMore, BugReport, Refresh } from "@mui/icons-material";
import { envConfig } from "../config/env";

interface DebugInfo {
  userAgent: string;
  apiBaseUrl: string;
  isMobile: boolean;
  localStorage: any;
  timestamp: string;
  networkStatus: string;
}

const MobileDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const updateDebugInfo = () => {
    const info: DebugInfo = {
      userAgent: navigator.userAgent,
      apiBaseUrl: envConfig.apiBaseUrl,
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ),
      localStorage: {
        authToken: localStorage.getItem("authToken") ? "Present" : "Missing",
        userId: localStorage.getItem("userId") || "Missing",
        userInfo: localStorage.getItem("userInfo") ? "Present" : "Missing",
      },
      timestamp: new Date().toISOString(),
      networkStatus: navigator.onLine ? "Online" : "Offline",
    };
    setDebugInfo(info);
  };

  useEffect(() => {
    updateDebugInfo();
  }, []);

  const testApiConnection = async () => {
    try {
      console.log("🧪 Testing API connection...");
      const response = await fetch(`${envConfig.apiBaseUrl}/hello`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.text();
      console.log("✅ API test successful:", { status: response.status, data });
      alert(`API Test: ${response.status} - ${data}`);
    } catch (error) {
      console.error("❌ API test failed:", error);
      alert(`API Test Failed: ${error}`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    updateDebugInfo();
    alert("Local storage cleared!");
  };

  // Only show on mobile devices
  if (!debugInfo?.isMobile) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: "90vw",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 2,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <BugReport sx={{ mr: 1, color: "orange" }} />
          <Typography variant="h6" sx={{ color: "orange" }}>
            Mobile Debug
          </Typography>
          <Button
            size="small"
            onClick={() => setIsVisible(!isVisible)}
            sx={{ ml: "auto", color: "white" }}
          >
            {isVisible ? "Hide" : "Show"}
          </Button>
        </Box>

        {isVisible && (
          <>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                size="small"
                onClick={testApiConnection}
                sx={{ mr: 1, mb: 1 }}
              >
                Test API
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={clearStorage}
                sx={{ mr: 1, mb: 1 }}
              >
                Clear Storage
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={updateDebugInfo}
                startIcon={<Refresh />}
                sx={{ mb: 1 }}
              >
                Refresh
              </Button>
            </Box>

            <Accordion sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: "white" }} />}
              >
                <Typography variant="subtitle2">Debug Info</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>API Base URL:</strong> {debugInfo?.apiBaseUrl}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Network:</strong>{" "}
                    <Chip
                      label={debugInfo?.networkStatus}
                      size="small"
                      color={
                        debugInfo?.networkStatus === "Online"
                          ? "success"
                          : "error"
                      }
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Storage:</strong>
                  </Typography>
                  <Box sx={{ ml: 1 }}>
                    {Object.entries(debugInfo?.localStorage || {}).map(
                      ([key, value]) => (
                        <Typography key={key} variant="body2">
                          {key}: <Chip label={String(value)} size="small" />
                        </Typography>
                      )
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Time:</strong> {debugInfo?.timestamp}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Alert severity="info" sx={{ mt: 1, fontSize: "0.75rem" }}>
              Check browser console for detailed logs
            </Alert>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default MobileDebugPanel;
