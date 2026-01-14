import React, { useState } from "react";
import { authService } from "../services";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Link,
} from "@mui/material";

interface RegistrationFormProps {
  onSwitchToLogin: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.firstName || undefined,
        formData.lastName || undefined
      );

      if (response.code === 201) {
        setSuccess("Registration successful! You can now log in.");
        // Clear form
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
        });
        // Optionally auto-switch to login after a delay
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setError(response.msg);
      }
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
        Register
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
          disabled={loading}
          fullWidth
          variant="outlined"
          helperText="Minimum 3 characters"
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={loading}
          fullWidth
          variant="outlined"
        />

        <TextField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          disabled={loading}
          fullWidth
          variant="outlined"
        />

        <TextField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          disabled={loading}
          fullWidth
          variant="outlined"
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={loading}
          fullWidth
          variant="outlined"
          helperText="Minimum 6 characters"
        />

        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          disabled={loading}
          fullWidth
          variant="outlined"
        />

        {error && <Alert severity="error">{error}</Alert>}

        {success && <Alert severity="success">{success}</Alert>}

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? "Creating Account..." : "Register"}
        </Button>

        <Box textAlign="center" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Already have an account?{" "}
            <Link
              component="button"
              type="button"
              onClick={onSwitchToLogin}
              disabled={loading}
              sx={{ textDecoration: "none" }}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RegistrationForm;
